import { inngest } from "@/lib/inngest/client";
import { z } from "zod";

BigInt.prototype.toJSON = function () {
    return this.toString();
};


const Hash = z.string().refine(value => value.startsWith('0x'), {
    message: "Hash/Hex must start with '0x'",
});


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const input = z.object({
            transactionHash: Hash,
            chainId: z.number(),
            accountAddress: Hash,
        }).parse(body);

        await inngest.send({
            name: "app/chain.transaction.confirmed",
            data: {
                transactionHash: input.transactionHash,
                chainId: input.chainId,
                address: input.accountAddress,
            },
        })

        return new Response(JSON.stringify({
            status: "success",
        }), {
            headers: {
                'Content-Type': 'application/json',
            }
        })
    } catch (e) {
        if (e instanceof Error) {
            return new Response(JSON.stringify({
                status: "error",
                message: e.message,
            }), {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }
    }
}