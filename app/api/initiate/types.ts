import { z } from "zod";
import { EthereumAddress } from "@/lib/core/model/Address";
import { Route } from "@/lib/li.fi-ts";
import { zeroAddress } from "viem";

BigInt.prototype.toJSON = function () {
    return this.toString();
};

// Validator function to allow only one sender for the zero address (ETH); sender must be the gasPayer
const onlyOneEthSender = (gasPayer: string) => z.custom((_from) => {
    const from = _from as Record<string, Record<string, bigint>>;
    // Get all addresses sending non-zero amounts from the zero address
    const senders = Object.entries(from[zeroAddress] || {})
        .filter(([, amount]) => BigInt(amount) > BigInt(0))
        .map(([address]) => address);

    // Check if zero address has exactly one sender and the sender is the gasPayer
    if (senders.length !== 1 || senders[0] !== gasPayer) {
        return false;
    }

    return true;
}, { message: 'Only the gasPayer can send from the zero address (ETH) and it must be the only sender.' });


export const InputInitiate = z.object({
    from: z.record(EthereumAddress, z.record(EthereumAddress, z.coerce.bigint())), // fromToken -> fromAddress -> amount
    gasPayer: EthereumAddress,
    account: EthereumAddress,
    chainId: z.number(),
    routes: z.array(Route.zod),
    maxFeePerGas: z.coerce.bigint().optional(),
    maxPriorityFeePerGas: z.coerce.bigint().optional(),
})

export const StrictInputInitiate = InputInitiate.refine(data => onlyOneEthSender(data.gasPayer).parse(data.from), {
    message: 'Only the gasPayer can send from the zero address (ETH) and it must be the only sender.',
    path: ['from'],
});


export const InitiateResponse = z.object({
    status: z.literal("success"),
    address: z.string(),
    txn: z.any(),
    id: z.string(),
});