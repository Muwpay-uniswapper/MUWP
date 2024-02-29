import { Step } from "@/lib/li.fi-ts";
import { muwpChains } from "@/muwp";
import { createPublicClient, encodeFunctionData, encodePacked, extractChain, getContract, http, toHex, zeroAddress } from "viem";
import { OmnichainAptosBridge } from "./omnichains";
import { OmnichainAptosBridgeAbi } from "./abi";
import { z } from "zod";
import { transactionRequestSchema } from "@/lib/inngest/consumeStep";


export async function AptosBridgeTxData(step: Step): Promise<Step> {
    const client = createPublicClient({
        chain: extractChain({
            chains: muwpChains,
            id: step.action.fromChainId
        }),
        transport: http()
    })
    const contract = getContract({
        address: OmnichainAptosBridge[step.action.fromChainId] as `0x${string}`,
        abi: OmnichainAptosBridgeAbi,
        // 1a. Insert a single client
        client,
    })

    const aptosGas = await fetch("https://mainnet.aptoslabs.com/v1/estimate_gas_price").then((res) => res.json());
    const gasUnits = 1301n;
    const estimate = gasUnits * BigInt(aptosGas.gas_estimate) * 4n;

    const adapterParams = encodePacked(
        ["uint16", "uint256", "uint256", "bytes"], // [txType  extraGas  airdropAmt  airdropAddress]
        [
            2,
            10000n,
            estimate,
            step.action.toAddress as `0x${string}` // Aptos address to receive gas
        ]
    )

    const [nativeFee, _zroFee] = await contract.read.quoteForSend([{
        refundAddress: step.action.fromAddress as `0x${string}`,
        zroPaymentAddress: zeroAddress,
    }, adapterParams])

    if (step.action.fromToken.address == zeroAddress) {
        const args = [
            step.action.toAddress as `0x${string}`,
            BigInt(step.action.fromAmount),
            {
                refundAddress: step.action.fromAddress as `0x${string}`,
                zroPaymentAddress: zeroAddress,
            },
            adapterParams
        ] as const

        const simulation = await contract.simulate.sendETHToAptos(args, {
            value: BigInt(step.action.fromAmount) + nativeFee
        })

        const encodedData = encodeFunctionData({
            abi: contract.abi,
            args,
            functionName: "sendETHToAptos"
        })

        const txRequest: z.infer<typeof transactionRequestSchema> = {
            chainId: step.action.fromChainId,
            data: encodedData,
            from: step.action.fromAddress as `0x${string}`,
            gasLimit: toHex(BigInt(step.estimate?.gasCosts?.[0].amount ?? simulation.request.gas?.toString() ?? "0")),
            gasPrice: toHex(BigInt(step.estimate?.gasCosts?.[0].price ?? simulation.request.gasPrice?.toString() ?? "0")),
            to: contract.address,
            value: toHex(BigInt(step.action.fromAmount) + nativeFee),
        }

        return {
            ...step,
            transactionRequest: txRequest
        }
    }

    const args = [
        step.action.fromToken.address as `0x${string}`,
        step.action.toAddress as `0x${string}`,
        BigInt(step.action.fromAmount),
        {
            refundAddress: step.action.fromAddress as `0x${string}`,
            zroPaymentAddress: zeroAddress,
        },
        adapterParams
    ] as const

    // const simulation = await contract.simulate.sendToAptos(args)

    const encodedData = encodeFunctionData({
        abi: contract.abi,
        args,
        functionName: "sendToAptos"
    })

    const gasPrice = BigInt(step.estimate?.gasCosts?.[0].price /* ?? simulation.request.gasPrice?.toString() */ ?? "0");
    const gasLimit = BigInt(step.estimate?.gasCosts?.[0].amount /* ?? simulation.request.gas?.toString() */ ?? "0") / gasPrice;

    const txRequest: z.infer<typeof transactionRequestSchema> = {
        chainId: step.action.fromChainId,
        data: encodedData,
        from: step.action.fromAddress as `0x${string}`,
        gasLimit: toHex(gasLimit),
        gasPrice: toHex(gasPrice),
        to: contract.address,
        value: toHex(nativeFee),
    }

    return {
        ...step,
        transactionRequest: txRequest
    }
}