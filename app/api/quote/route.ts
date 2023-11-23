import { advancedAPI } from "@/lib/front/data/api";
import { z } from 'zod';

const Address = z
    .string()
    .refine(value =>
        /^(0x)?[0-9a-fA-F]{40}$/.test(value),
        {
            message: 'Invalid Ethereum address.',
            path: [], // path is kept empty to indicate whole string should be validated
        }
    );

const Token = z.object({
    address: Address,
    value: z.string(),
});

const Input = z.object({
    inputTokens: z.array(Token),
    outputToken: Token,
    inputChain: z.number(),
    outputChain: z.number(),
    inputAmount: z.record(z.coerce.bigint()),
    fromAddress: Address,
    toAddress: Address.optional(),
});

// Export Input type for use in other files
export type InputType = z.infer<typeof Input>;


export async function POST(request: Request) {
    // Parse the incoming request body as JSON data
    const body = await request.json();
    const input = Input.parse(body);

    const routes = await advancedAPI.advancedRoutesPost({
        fromAmount: input.inputAmount[input.inputTokens[0].value].toString(),
        fromChainId: input.inputChain,
        fromTokenAddress: input.inputTokens[0].address,
        toChainId: input.outputChain,
        toTokenAddress: input.outputToken.address,
        fromAddress: input.fromAddress,
        toAddress: input.toAddress,
    });

    return new Response(JSON.stringify(routes), {
        headers: { 'content-type': 'application/json' },
    });
}
