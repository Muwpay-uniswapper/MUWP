import { RouteOptions } from "@/lib/li.fi-ts";
import { z } from 'zod';
import { generateAccount } from "./generateAccount";
import { handleLiFiRoutes } from "./fetchRoutesLiFi";
import { Address, EthereumAddress } from "@/lib/core/model/Address";

const Token = z.object({
    address: Address,
    value: z.string(),
});

const Input = z.object({
    inputTokens: z.array(Token).min(1),
    outputTokens: z.array(Token).min(1),
    distribution: z.array(z.number()).min(1),
    inputChain: z.number(),
    outputChain: z.number(),
    inputAmount: z.record(z.coerce.bigint()),
    fromAddress: EthereumAddress,
    tempAccount: EthereumAddress.optional(),
    toAddress: Address.optional(),
    options: RouteOptions.zod.optional(),
});

// Export Input type for use in other files
export type InputType = z.infer<typeof Input>;

BigInt.prototype.toJSON = function () {
    return this.toString();
};

// Can be 'nodejs', but Vercel recommends using 'edge'
export const runtime = 'edge';
// Prevents this route's response from being cached
export const dynamic = 'force-dynamic';

function iteratorToStream(iterator: any) {
    return new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next()

            if (done) {
                controller.close()
            } else {
                const chunk = new TextEncoder().encode(value)
                controller.enqueue(chunk)
            }
        },
    })
}

async function* iterator(promise: () => Promise<string>) {
    yield '{'; // This way we bypass the Vercel function timeout
    const response = await promise();
    yield response.slice(1, -1);
    yield '}';
}

export async function POST(request: Request) {
    const stream = iteratorToStream(iterator(async () => {
        try {
            // Parse the incoming request body as JSON data
            const body = await request.json();
            const input = await Input.parseAsync(body);

            console.log("Input parsed successfully");

            const { tempAccount } = await generateAccount(input);

            console.log("Fetching routes");

            const { routes } = await handleLiFiRoutes(input, tempAccount);

            return JSON.stringify({
                routes,
                tempAccount,
                validUntil: Date.now() + 1000 * 60 * 5, // 5 minutes
            })
        } catch (e) {
            if (e instanceof Error) {
                console.log(e.message)
                const bodyPattern = /Body: \"(\{.*\})\"/;
                const matches = e.message.match(bodyPattern);

                if (matches && matches.length > 1) {
                    const bodyContent = JSON.parse(matches[1].replace(/\\/g, ''));
                    return JSON.stringify({ message: bodyContent.message });
                }
            }
            return JSON.stringify({ message: "Unexpected error" });
        }
    }));

    return new Response(stream, {
        headers: {
            'content-type': 'application/json',
            'cache-control': 'no-cache',
        },
    });
}
