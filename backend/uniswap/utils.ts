import { InvalidAddressError } from "viem";

export function serializeBigInt<T>(
    obj: T): string | string[] | Record<string, string> | T {
    if (typeof obj === "bigint") {
        return obj.toString();
    }
    if (Array.isArray(obj)) {
        return obj.map(serializeBigInt);
    }
    if (typeof obj === "object" && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)])
        );
    }
    return obj;
}

export async function retry<T>(
    fn: () => Promise<T>,
    maxRetries = 2,
    delay = 500,
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (error instanceof InvalidAddressError) {
            return null as T; // Pool does not exist
        }
        if (maxRetries === 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retry(fn, maxRetries - 1, delay * 2);
    }
}