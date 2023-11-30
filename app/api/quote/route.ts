import { advancedAPI } from "@/lib/front/data/api";
import { Route } from "@/lib/li.fi-ts";
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

BigInt.prototype.toJSON = function () {
    return this.toString();
};

export async function POST(request: Request) {
    // Parse the incoming request body as JSON data
    const body = await request.json();
    const input = Input.parse(body);

    console.log(JSON.stringify(input, null, 2));

    const queries = input.inputTokens.map(inToken => advancedAPI.advancedRoutesPost({
        fromAmount: input.inputAmount[inToken.value].toString(),
        fromChainId: input.inputChain,
        fromTokenAddress: inToken.address,
        toChainId: input.outputChain,
        toTokenAddress: input.outputToken.address,
        fromAddress: input.fromAddress,
        toAddress: input.toAddress,
    }))

    const rawRoutes = await Promise.all(queries); // Fetch all routes in parallel

    const routes: { [key: string]: Route[] } = {};

    for (let index = 0; index < rawRoutes.length; index++) {
        const rawRoute = rawRoutes[index];
        const _routes = rawRoute.routes;
        if (!_routes || typeof rawRoute.routes[0].fromAddress == "undefined") {
            console.log(JSON.stringify(rawRoute.unavailableRoutes?.filteredOut, null, 2));
            throw new Error(`No route found for ${input.inputTokens[index].value} -> ${input.outputToken.value}`);
        }
        const key = rawRoute.routes[0].fromToken.address;
        routes[key] = _routes;
    }


    return new Response(JSON.stringify(routes), {
        headers: { 'content-type': 'application/json' },
    });
}
