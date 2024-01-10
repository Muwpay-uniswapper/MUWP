import * as store from "@/lib/kv/store";
import { z } from "zod";

const Address = z
    .array(z.string().refine(value =>
        /^(0x)?[0-9a-fA-F]{40}$/.test(value),
        {
            message: 'Invalid Ethereum address.',
            path: [], // path is kept empty to indicate whole string should be validated
        }));

export async function POST(request: Request) {
    const body = await request.json();
    const input = await Address.parseAsync(body);

    const response: {
        [key: string]: string | {
            completed: string[],
            errors: string[],
        }
    } = {};

    for (const address of input) {
        try {
            const accountInfo = await store.get(address) as string | object | null;
            const completed: any | null = typeof accountInfo === "string" ? JSON.parse(accountInfo)
                : typeof accountInfo === "object" ? (accountInfo as any)
                    : null;

            if (!completed) {
                response[address] = 'Account not found';
            } else {
                response[address] = {
                    completed: Array.from(new Set(completed.completed)),
                    errors: completed.errors,
                }
            }
        } catch (e) {
            if (e instanceof Error) {
                response[address] = e.message
            }
        }
    }

    return new Response(JSON.stringify(response));
}