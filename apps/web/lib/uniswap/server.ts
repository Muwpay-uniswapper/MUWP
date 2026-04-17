import { Hono } from 'hono'
import uniswap from './index'

const app = new Hono()

app.route('/uniswap', uniswap.app);

const server = {
    fetch: app.fetch,
    websocket: uniswap.websocket
};

export default server;