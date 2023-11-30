import { kv } from "@vercel/kv";

export async function set(key: string, value: string) {
    await kv.set(key, value);
}

export async function get(key: string) {
    return await kv.get(key);
}

export async function del(key: string) {
    await kv.del(key);
}