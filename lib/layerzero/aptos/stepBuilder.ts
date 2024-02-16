import { nanoid } from "nanoid";
import { OmnichainAptosBridge, RequiredBlockConfirmationAptos, getTokensAptosBridge } from "./omnichains";
import { createPublicClient, encodePacked, extractChain, formatUnits, getContract, http, parseEther, parseUnits, zeroAddress } from "viem";
import api from "@/lib/core/data/api";
import { OmnichainAptosBridgeAbi } from "./abi";
import { muwpChains } from "@/muwp";
import { Step, StepTypeEnum } from "@/lib/li.fi-ts";

export async function FinalAptosStepBuilder({
    target,
    fromChainId,
    fromTokenAddress,
    fromAmount,
    fromAddress,
    toAddress
}: {
    target: `0x${string}` | string;
    fromChainId: number;
    fromTokenAddress: `0x${string}` | string;
    fromAmount: string;
    fromAddress: `0x${string}` | string;
    toAddress: `0x${string}` | string;
}): Promise<Step> {
    const client = createPublicClient({
        chain: extractChain({
            chains: muwpChains,
            id: fromChainId
        }),
        transport: http()
    })

    const [aptosToken, fromToken, nativeToken, aptosGas, block10Time] = await Promise.all([
        getTokensAptosBridge(),
        api.tokenGet(fromChainId.toString(), fromTokenAddress),
        api.tokenGet(fromChainId.toString(), zeroAddress),
        fetch("https://mainnet.aptoslabs.com/v1/estimate_gas_price").then((res) => res.json()),
        client.getBlock().then(async block => block.timestamp - await client.getBlock({ blockNumber: block.number - 10n }).then(block => block.timestamp))
    ]);

    console.log(`Fetching routes for ${fromToken.name} -> ${aptosToken.tokens?.find(t => t.address == target)!.name}`);

    const contract = getContract({
        address: OmnichainAptosBridge[fromChainId] as `0x${string}`,
        abi: OmnichainAptosBridgeAbi,
        // 1a. Insert a single client
        client,
    })

    const gasUnits = 1301n;
    const estimate = gasUnits * BigInt(aptosGas.gas_estimate) * 4n;

    console.log(`Aptos gas: ${estimate}`);

    // 2. Call contract methods, fetch events, listen to events, etc.
    const adapterParams = encodePacked(
        ["uint16", "uint256", "uint256", "bytes"], // [txType  extraGas  airdropAmt  airdropAddress]
        [
            2,
            10000n,
            estimate,
            toAddress as `0x${string}` // Aptos address to receive gas
        ]
    )

    const [nativeFee, zroFee] = await contract.read.quoteForSend([{
        refundAddress: fromAddress as `0x${string}`,
        zroPaymentAddress: zeroAddress,
    }, adapterParams])

    let gasEstimate = nativeFee;

    // if (fromTokenAddress == zeroAddress) {
    const weth = await contract.read.weth();

    const rawGasEstimate = await contract.estimateGas.sendETHToAptos([
        toAddress as `0x${string}`,
        parseEther("1"),
        {
            refundAddress: fromAddress as `0x${string}`,
            zroPaymentAddress: zeroAddress,
        },
        adapterParams
    ], {
        account: weth,
        value: parseEther("1") + nativeFee
    });

    gasEstimate += rawGasEstimate * await client.getGasPrice();

    console.log(`Gas estimate: ${gasEstimate - nativeFee}`);
    console.log(`Native fee: ${nativeFee}`);

    const toToken = aptosToken.tokens?.find(t => t.address == target)!;
    const toAmount = fromToken.decimals > toToken.decimals ? BigInt(fromAmount) / (10n ** BigInt(fromToken.decimals - toToken.decimals)) : BigInt(fromAmount) * (10n ** BigInt(toToken.decimals - fromToken.decimals));

    // Time to execute the transaction
    const confirmations = RequiredBlockConfirmationAptos[fromChainId];
    const timePerBlock = Number(block10Time) / 10; // Unix timestamp in seconds
    const extraDelay = 10; // (mempool delay - depends on GAS)
    const executionDuration = (confirmations + 1) * timePerBlock + extraDelay;

    return {
        id: nanoid(),
        action: {
            fromAmount: fromAmount,
            fromChainId: fromChainId,
            fromToken,
            toChainId: fromChainId,
            toToken,
            fromAddress: fromAddress,
            toAddress: toAddress,
            slippage: 0, // Bridge only supports one to one swaps
        },

        estimate: {
            approvalAddress: OmnichainAptosBridge[fromChainId],
            fromAmount: fromAmount,
            toAmount: toAmount.toString(),
            toAmountMin: toAmount.toString(),
            tool: "layerzero",
            feeCosts: [{
                amount: nativeFee.toString(),
                amountUSD: formatUnits(parseUnits(nativeToken.priceUSD ?? "0", nativeToken.decimals) * nativeFee, nativeToken.decimals * 2),
                included: true,
                name: "LayerZero (Native)",
                percentage: (Number(nativeFee * 10000n / BigInt(fromAmount)) / 10000).toString(),
                token: nativeToken,
                description: "Native LayerZero fee",
            }],
            executionDuration,
            gasCosts: [{
                amount: gasEstimate.toString(),
                type: "SEND",
                token: nativeToken,
                amountUSD: formatUnits(parseUnits(nativeToken.priceUSD ?? "0", nativeToken.decimals) * gasEstimate, nativeToken.decimals * 2),
                estimate: gasEstimate.toString(),
                price: await client.getGasPrice().then(price => price.toString()),
            }]
        },
        tool: "layerzero",
        toolDetails: {
            key: "theaptosbridge",
            name: "The Aptos Bridge",
            logoURI: "/icons/aptosbridge.svg"
        },
        type: StepTypeEnum.Cross,
    }
}