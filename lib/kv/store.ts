// import { kv } from "@vercel/kv";

// export async function set(key: string, value: string) {
//     await kv.set(key, value);
// }

// export async function get(key: string) {
//     return await kv.get(key);
// }

// export async function del(key: string) {
//     await kv.del(key);
// }

export async function set(key: string, value: string) {
    if (key === "") {
        return;
    }
    const url = process.env.KV_WORKER_URL?.trim() as string;
    const secret = process.env.KV_SECRET?.trim() as string;

    await fetch(`${url}/${key}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${secret}`
        },
        body: value,
    })
}

export async function get(key: string) {
    if (key === "") {
        return null;
    }

    const url = process.env.KV_WORKER_URL?.trim() as string;
    const secret = process.env.KV_SECRET?.trim() as string;

    const res = await fetch(`${url}/${key}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${secret}`
        },
    })
    if (res.status !== 200) {
        throw new Error("Key not found");
    }

    return await res.text();
}

export async function del(key: string) {
    if (key === "") {
        return;
    }
    const url = process.env.KV_WORKER_URL?.trim() as string;
    const secret = process.env.KV_SECRET?.trim() as string;

    await fetch(`${url}/${key}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${secret}`
        },
    })
}