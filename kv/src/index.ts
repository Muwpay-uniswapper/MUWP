/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	MUWP: KVNamespace;
	KV_SECRET: string;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Check if the request is authorized with HTTP Basic Authentication

		const auth = request.headers.get('Authorization');
		if (!auth || auth !== `Basic ${env.KV_SECRET}`) {
			return new Response('Unauthorized', { status: 401 });
		}

		const url = new URL(request.url);
		const key = url.pathname.split("/")[1];  // Assume path is /key

		switch (request.method) {
			case 'GET':
				const content = await env.MUWP.get(key.toLowerCase(), 'json');

				if (content === null) {
					return new Response("Key not found", { status: 404 });
				}
				return new Response(JSON.stringify(content));

			case 'PUT':
				const data = await request.json();
				if (!data) {
					return new Response('Missing JSON data', { status: 400 });
				}
				await env.MUWP.put(key.toLowerCase(), JSON.stringify(data));
				return new Response('Stored Value', { status: 200 });

			case 'DELETE':
				await env.MUWP.delete(key.toLowerCase());
				return new Response('Deleted Value', { status: 200 });

			default:
				return new Response('Invalid HTTP Method', { status: 405 });
		}
	}
};