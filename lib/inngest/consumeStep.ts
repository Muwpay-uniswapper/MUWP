import { inngest } from "./client";
import { z } from "zod";
import * as store from "@/lib/kv/store";
import { Step } from "../li.fi-ts";
import { advancedAPI } from "../core/data/api";
import { TransactionExecutionError, createPublicClient, createWalletClient, erc20Abi, extractChain, fromHex, getContract, http, publicActions, zeroAddress } from 'viem'
import { HDKey, hdKeyToAccount } from 'viem/accounts'
import * as chains from 'viem/chains'
import { Address, EthereumAddress } from "../core/model/Address";
import { AptosBridgeTxData } from "../layerzero/aptos/txData";
import { AllBridgeTxData } from "../allbridge/txData";


const Hash = z.string().regex(/^0x[0-9a-fA-F]+$/, "Hash must be a valid hex string");

export const transactionRequestSchema = z.object({
    from: EthereumAddress, // Ethereum address format
    to: Address, // Ethereum address format
    chainId: z.number().int(), // Chain ID should be an integer
    data: Hash, // Data field should start with 0x followed by hex characters
    value: Hash.optional(), // Value should be in hex format
    gasPrice: Hash.optional(), // Gas price should be in hex format
    gasLimit: Hash.optional(), // Gas limit should be in hex format
});


export const consumeStep = inngest.createFunction(
    {
        id: "consume-step",
        retries: 10, // This way, we can ensure that the step will be executed over 2 hours (backoff time is exponential)
    },
    { event: "app/consume.steps" },
    async ({ event, step }) => {
        const { remainingSteps, address, id, originalChainId, totalRoutes, index, refundAddress } = await z.object({
            address: EthereumAddress, // temp account
            remainingSteps: z.array(Step.zod),
            totalRoutes: z.number().int(),
            id: z.string().optional(),
            index: z.number().int().optional(),
            refundAddress: EthereumAddress,
            originalChainId: z.number().int(),
        }).parseAsync(event.data);

        if (remainingSteps.length === 0) return; // Should not happen, but just in case

        const _step = remainingSteps[0];

        const { transactionRequest, approvalAddress, amount, nonce } = await step.run(`approvals-${_step.id}`, async () => {
            let _index = index;
            const client = await getWallet(address, _step.action.fromChainId);

            _index = Math.max(_index ?? 0, await client.getTransactionCount({ address: client.account.address }));

            const amount = await getBalance(_step.action.fromToken.address as `0x${string}`, address as `0x${string}`, BigInt(_step.action.fromAmount), _step.action.fromChainId);
            _step.action.fromAmount = amount.toString();

            _step.action.slippage = 1.0; // 100% slippage
            if (_step.estimate) {
                _step.estimate.toAmountMin = "1"; // 1 output token, which is like 0.00...1 ETH
            }

            if (_step.action.fromToken.address !== zeroAddress) {
                // Approvals
                const contract = getContract({
                    address: _step.action.fromToken.address as `0x${string}`,
                    abi: erc20Abi,
                    client,
                })

                const approvalAddress = _step.estimate?.approvalAddress ?? _step.estimate?.approvalAddress as `0x${string}`

                const _allowance = await contract.read.allowance([
                    client.account.address as `0x${string}`,
                    approvalAddress as `0x${string}`
                ])

                const allowance = BigInt(_allowance)

                if (allowance < amount) {
                    const hash = await contract.write.approve([approvalAddress as `0x${string}`, amount], {
                        nonce: _index,
                    });

                    _index += 1;

                    await client.waitForTransactionReceipt({ hash }) // This may take a while and make the workflow timeout. In that case, it will just be retried
                }
            }

            let fullStep: Step;
            if (_step.tool == "layerzero") {
                fullStep = await AptosBridgeTxData(_step as Step);
            } else if (_step.tool == "Allbridge") {
                fullStep = await AllBridgeTxData(_step as Step);
            } else {
                fullStep = await advancedAPI.advancedStepTransactionPost(_step as Step);
            }
            const transactionRequest = await transactionRequestSchema.parseAsync(fullStep.transactionRequest)
            if (fullStep.action.fromAddress !== address) throw new Error("Address mismatch")

            return { transactionRequest, approvalAddress: fullStep.estimate?.approvalAddress ?? _step.estimate?.approvalAddress as `0x${string}`, amount: amount.toString(), nonce: _index }
        })

        const { hash, chainId } = await step.run(`step-${_step.id}`, async () => {
            const client = await getWallet(address, transactionRequest.chainId);

            // Check if allowance is sufficient
            if (_step.action.fromToken.address !== zeroAddress) {
                const contract = getContract({
                    address: _step.action.fromToken.address as `0x${string}`,
                    abi: erc20Abi,
                    client
                })

                const _allowance = await contract.read.allowance([
                    client.account.address as `0x${string}`,
                    approvalAddress as `0x${string}`
                ])

                const allowance = BigInt(_allowance)

                const _amount = BigInt(amount)

                if (allowance < _amount) {
                    throw new Error("Allowance insufficient")
                }
            }

            console.log("Sending transaction", transactionRequest)

            try {
                let _nonce: number | undefined = Math.max(nonce, await client.getTransactionCount({ address: client.account.address }));
                if (isNaN(_nonce)) {
                    _nonce = undefined;
                }
                const txData: {
                    data: `0x${string}`,
                    to: `0x${string}`,
                    value?: bigint,
                    gas?: bigint,
                    gasPrice?: bigint,
                    nonce?: number,
                } = {
                    data: transactionRequest.data as `0x${string}`,
                    to: transactionRequest.to as `0x${string}`,
                    value: transactionRequest.value ? fromHex(transactionRequest.value as `0x${string}`, "bigint") : undefined,
                    gas: transactionRequest.gasLimit ? fromHex(transactionRequest.gasLimit as `0x${string}`, "bigint") : undefined,
                    gasPrice: transactionRequest.gasPrice ? fromHex(transactionRequest.gasPrice as `0x${string}`, "bigint") : undefined,
                    nonce: _nonce
                }

                if (_step.tool == "layerzero" || _step.tool == "Allbridge") {
                    delete txData.gas;
                    delete txData.gasPrice;
                }


                const hash = await client.sendTransaction(txData)

                console.log("Transaction sent", hash)

                const tx = await client.waitForTransactionReceipt({ hash })

                if (tx.status !== "success") {
                    const _stored = await store.get(address) as string | object | undefined;
                    const stored = typeof _stored === "string" ? JSON.parse(_stored) : _stored;
                    await store.set(address, JSON.stringify({
                        ...stored,
                        failed: true,
                        errors: {
                            ...stored?.errors,
                            [_step.id]: `Transaction reverted: ${hash}`,
                        }
                    }))
                    throw new Error("Transaction reverted")
                }

                return { hash, chainId: transactionRequest.chainId }
            } catch (e) {
                if (e instanceof TransactionExecutionError) {
                    const _stored = await store.get(address) as string | object | undefined;
                    const stored = typeof _stored === "string" ? JSON.parse(_stored) : _stored;
                    await store.set(address, JSON.stringify({
                        ...stored,
                        failed: true,
                        errors: {
                            ...stored?.errors,
                            [_step.id]: e.shortMessage,
                        }
                    }))
                }
                throw e;
            }
        })

        const _remainingSteps = remainingSteps.slice(1);

        if (_remainingSteps.length > 0) {
            return await step.sendEvent("app/consume.steps", {
                name: "app/consume.steps",
                data: {
                    address,
                    remainingSteps: _remainingSteps,
                    totalRoutes,
                    id,
                    index: (index ?? 0) + 1,
                    originalChainId,
                    refundAddress
                }
            })
        }

        await step.run("route-completed", async () => {
            const accountInfo = await store.get(address) as string | object | undefined;
            const info = typeof accountInfo === "string" ? JSON.parse(accountInfo) : accountInfo;

            if (!info) {
                throw new Error("Account not found");
            }

            const completed = info.completed ?? [];
            completed.push(event.data.id);

            await store.set(address, JSON.stringify({
                ...info,
                completed,
            }));

            // Check if all routes are completed
            if (completed.length === event.data.totalRoutes) {
                const client = await getWallet(address, originalChainId);
                // Send native funds back to user
                const balance = await client.getBalance({ address: client.account.address })
                const gas = await client.getGasPrice()
                const hash = await client.sendTransaction({
                    to: refundAddress as `0x${string}`, // process.env.REFUND_ADDRESS as `0x${string}`,
                    value: balance - gas * BigInt(21000),
                    gasPrice: gas,
                    type: "legacy"
                })

                console.log("Sending native funds back to user", hash)

                return { hash }
            }
        })
    },
);

export async function getWallet(address: string, chainId: number) {
    const master_hd = process.env.MASTER_HD?.trim() as `0x${string}`;
    const privateKey = fromHex(master_hd, "bytes");
    const hdKey = HDKey.fromMasterSeed(privateKey);

    const accountInfo = await store.get(address) as string | object | undefined;
    const index = typeof accountInfo === "string" ? JSON.parse(accountInfo).index
        : typeof accountInfo === "object" ? (accountInfo as any).index
            : null;

    if (!index) {
        throw new Error("Account not found");
    }

    const account = hdKeyToAccount(hdKey, {
        accountIndex: Number(index),
    });
    const client = createWalletClient({
        account,
        chain: extractChain({
            chains: Object.values(chains),
            id: chainId as any,
        }),
        transport: http()
    })
        .extend(publicActions);

    return client;
}

export async function getBalance(token: `0x${string}`, address: `0x${string}`, expectedBalance: bigint, chainId: number): Promise<bigint> {
    const client = createPublicClient({
        chain: extractChain({
            chains: Object.values(chains),
            id: chainId as any,
        }),
        transport: http()
    })

    if (token === zeroAddress) {
        return expectedBalance; // For ETH, we need to keep some gas, and if transaction is split, no need to check balance
    }
    const contract = getContract({
        address: token,
        abi: erc20Abi,
        client,
    })
    const _balance = await contract.read.balanceOf([address]);
    const balance = BigInt(_balance);
    // Check if balance is +/- 5% of expected balance
    if (balance < expectedBalance * BigInt(95) / BigInt(100) || balance > expectedBalance * BigInt(105) / BigInt(100)) {
        return expectedBalance;
    }
    return balance;
}