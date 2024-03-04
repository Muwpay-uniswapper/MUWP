import { EthereumAddress } from "@/lib/core/model/Address";
import { inngest } from "@/lib/inngest/client";
import { z } from "zod";
import { track } from '@vercel/analytics/server';

BigInt.prototype.toJSON = function () {
    return this.toString();
};


const Hash = z.string().regex(/^0x[0-9a-fA-F]+$/, "Hash must be a valid hex string");


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const input = z.object({
            transactionHash: Hash,
            chainId: z.number(),
            accountAddress: EthereumAddress,
        }).parse(body);

        const inngestID = await inngest.send({
            name: "app/funds.transferred",
            data: {
                transactionHash: input.transactionHash,
                chainId: input.chainId,
                address: input.accountAddress,
            },
        });

        await track('Swap started', {
            ...input,
            inngestID: inngestID.ids[0],
        });

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