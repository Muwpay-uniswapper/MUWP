// server.ts

import {
  Address,
  PublicClient,
} from "viem";
import { ChainId } from "@uniswap/sdk-core";
import { z } from "zod";
import { serializeBigInt } from "./utils";
import { customRPCs, getClient } from "./network";
import { getV2PoolData } from "./v2Pool";
import { getV3PoolData } from "./v3Pool";
import { Hono } from "hono";
import { createBunWebSocket } from 'hono/bun'
import type { ServerWebSocket } from 'bun'
import { WSContext } from "hono/ws";

// Zod schema for input validation
const InputSchema = z.object({
  token0: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  token1: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  version: z.enum(["v2", "v3"]),
  chainId: z.number().int().positive().default(ChainId.MAINNET),
  rpc: z.string().url().optional(),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
});

type WSInput = {
  client: PublicClient;
  token0: Address;
  token1: Address;
  chainId: number;
  version: string;
  walletAddress?: Address;
};

type ClientSubscriptionData = {
  walletAddress?: Address;
};

type PoolSubscription = {
  chainId: number;
  token0: Address;
  token1: Address;
  version: string;
  clients: Map<ServerWebSocket, ClientSubscriptionData>;
  walletClients: Map<string, Set<ServerWebSocket>>;
  lastData?: any;
};

type WebSocketClient = WSContext<ServerWebSocket>;

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

// Global chain watchers
const chainWatchers: {
  [chainId: number]: {
    client: PublicClient;
    unwatch: () => void;
  };
} = {};

// Global pool subscriptions
const poolSubscriptions: Map<string, PoolSubscription> = new Map();

// Map from client to set of PoolIdentifiers they are subscribed to
const clientSubscriptions: Map<ServerWebSocket, Set<string>> = new Map();

function getPoolIdentifier(
  chainId: number,
  token0: Address,
  token1: Address,
  version: string,
): string {
  return `${chainId}:${token0.toLowerCase()}:${token1.toLowerCase()}:${version}`;
}

async function poolData(input: WSInput) {
  // Fetch the data and return it
  const { client, token0, token1, chainId, walletAddress, version } = input;
  if (version === "v2") {
    return await getV2PoolData(
      client,
      token0,
      token1,
      chainId,
      walletAddress,
    );
  } else {
    return await getV3PoolData(
      client,
      token0,
      token1,
      chainId,
      walletAddress,
    );
  }
}

const app = new Hono()
  .get("/",
    upgradeWebSocket((c) => {
      return {
        onMessage(event, ws: WebSocketClient) {
          (async () => {
            try {
              const message = event.data.toString();
              const parsedMessage = JSON.parse(message);
              const { action, params } = parsedMessage;

              if (action === "start") {
                // Validate params
                const validatedInput = await InputSchema.parseAsync(params);

                const {
                  token0,
                  token1,
                  version,
                  chainId,
                  rpc,
                  walletAddress,
                } = validatedInput;

                const client = getClient(
                  chainId,
                  rpc || customRPCs[chainId as keyof typeof customRPCs],
                );
                if (!client) {
                  ws.send(JSON.stringify({ error: "Invalid chain ID" }));
                  return;
                }

                // Generate PoolIdentifier
                const poolIdentifier = getPoolIdentifier(
                  chainId,
                  token0 as Address,
                  token1 as Address,
                  version,
                );

                // Check if client is already subscribed to this pool
                const existingClientPools = ws.raw && clientSubscriptions.get(ws.raw);
                if (existingClientPools?.has(poolIdentifier)) {
                  ws.send(JSON.stringify({
                    error: "Already subscribed to this pool",
                    poolIdentifier,
                  }));
                  return;
                }

                let poolSubscription = poolSubscriptions.get(poolIdentifier);
                if (!poolSubscription) {
                  // Create new PoolSubscription
                  poolSubscription = {
                    chainId,
                    token0: token0 as Address,
                    token1: token1 as Address,
                    version,
                    clients: new Map(),
                    walletClients: new Map(),
                  };
                  poolSubscriptions.set(poolIdentifier, poolSubscription);
                }

                // Add client to PoolSubscription
                ws.raw && poolSubscription.clients.set(ws.raw, {
                  walletAddress: walletAddress as Address | undefined,
                });

                if (walletAddress) {
                  const walletAddrStr = walletAddress.toLowerCase();
                  let walletClientsSet = poolSubscription.walletClients.get(
                    walletAddrStr,
                  );
                  if (!walletClientsSet) {
                    walletClientsSet = new Set();
                    poolSubscription.walletClients.set(
                      walletAddrStr,
                      walletClientsSet,
                    );
                  }
                  ws.raw && walletClientsSet.add(ws.raw);
                }

                // Add PoolIdentifier to clientSubscriptions
                let clientPools = ws.raw && clientSubscriptions.get(ws.raw);
                if (!clientPools) {
                  clientPools = new Set();
                  ws.raw && clientSubscriptions.set(ws.raw, clientPools);
                }
                clientPools.add(poolIdentifier);

                // Ensure chainWatcher is active
                if (!chainWatchers[chainId]) {
                  chainWatchers[chainId] = {
                    client,
                    unwatch: () => { },
                  };
                  const chainWatcher = chainWatchers[chainId];
                  chainWatcher.unwatch = client.watchBlocks({
                    onBlock: async (blockNumber) => {
                      // On new block, process all pools on this chain
                      for (const [poolId, poolSub] of poolSubscriptions) {
                        if (poolSub.chainId === chainId) {
                          // Fetch base pool data once per pool
                          try {
                            const poolInput: WSInput = {
                              client,
                              token0: poolSub.token0,
                              token1: poolSub.token1,
                              chainId: poolSub.chainId,
                              version: poolSub.version,
                            };
                            const basePoolData = await poolData(poolInput);
                            poolSub.lastData = basePoolData;

                            // Send base data to clients without walletAddress
                            for (const [clientWs, clientData] of poolSub.clients) {
                              if (!clientData.walletAddress) {
                                clientWs.send(JSON.stringify({
                                  data: serializeBigInt(basePoolData),
                                  poolIdentifier: poolId,
                                }));
                              }
                            }

                            // For each unique walletAddress, fetch wallet-specific data once
                            for (const [walletAddr, clientsSet] of poolSub.walletClients) {
                              const walletInput: WSInput = {
                                client,
                                token0: poolSub.token0,
                                token1: poolSub.token1,
                                chainId: poolSub.chainId,
                                version: poolSub.version,
                                walletAddress: walletAddr as Address,
                              };
                              const walletData = await poolData(walletInput);

                              // Send wallet data to each client
                              for (const clientWs of clientsSet) {
                                clientWs.send(JSON.stringify({
                                  data: serializeBigInt(walletData),
                                  poolIdentifier: poolId,
                                }));
                              }
                            }

                          } catch (error) {
                            console.error("Error fetching pool data:", error);
                            // Handle error per pool
                            for (const [clientWs] of poolSub.clients) {
                              clientWs.send(JSON.stringify({
                                error: "Failed to fetch pool data",
                                poolIdentifier: poolId,
                              }));
                            }
                          }
                        }
                      }
                    },
                    onError: (error) => {
                      console.error("Error watching blocks:", error);
                    },
                  });
                }

                // Send immediate data to client
                try {
                  const poolInput: WSInput = {
                    client,
                    token0: token0 as Address,
                    token1: token1 as Address,
                    chainId,
                    version,
                  };
                  const basePoolData = await poolData(poolInput);

                  if (walletAddress) {
                    const walletInput: WSInput = {
                      client,
                      token0: token0 as Address,
                      token1: token1 as Address,
                      chainId,
                      version,
                      walletAddress: walletAddress as Address,
                    };
                    const walletData = await poolData(walletInput);
                    ws.send(JSON.stringify({
                      data: serializeBigInt(walletData),
                      poolIdentifier: poolIdentifier,
                      status: "subscribed",
                    }));
                  } else {
                    ws.send(JSON.stringify({
                      data: serializeBigInt(basePoolData),
                      poolIdentifier: poolIdentifier,
                      status: "subscribed",
                    }));
                  }
                } catch (error) {
                  console.error("Error fetching pool data:", error);
                  ws.send(JSON.stringify({
                    error: "Failed to fetch pool data",
                    poolIdentifier: poolIdentifier,
                  }));
                }

              } else if (action === "stop") {
                const { poolIdentifier } = params;
                if (poolIdentifier && poolSubscriptions.has(poolIdentifier)) {
                  const poolSubscription = poolSubscriptions.get(poolIdentifier)!;
                  const clientData = ws.raw && poolSubscription.clients.get(ws.raw);

                  if (clientData && clientData.walletAddress) {
                    const walletAddrStr = clientData.walletAddress.toLowerCase();
                    const walletClientsSet = poolSubscription.walletClients.get(
                      walletAddrStr,
                    );
                    if (walletClientsSet) {
                      ws.raw && walletClientsSet.delete(ws.raw);
                      if (walletClientsSet.size === 0) {
                        poolSubscription.walletClients.delete(walletAddrStr);
                      }
                    }
                  }

                  ws.raw && poolSubscription.clients.delete(ws.raw);

                  // Remove poolIdentifier from clientSubscriptions
                  const clientPools = ws.raw && clientSubscriptions.get(ws.raw);
                  if (clientPools) {
                    clientPools.delete(poolIdentifier);
                    if (clientPools.size === 0) {
                      ws.raw && clientSubscriptions.delete(ws.raw);
                    }
                  }

                  // If no clients left in poolSubscription, remove it
                  if (poolSubscription.clients.size === 0) {
                    poolSubscriptions.delete(poolIdentifier);
                  }

                  // If no pools left on chain, unwatch the chain
                  const poolsOnChain = Array.from(poolSubscriptions.values()).filter(
                    (ps) => ps.chainId === poolSubscription.chainId,
                  );
                  if (poolsOnChain.length === 0) {
                    const chainWatcher = chainWatchers[poolSubscription.chainId];
                    if (chainWatcher) {
                      chainWatcher.unwatch();
                      delete chainWatchers[poolSubscription.chainId];
                    }
                  }

                  ws.send(JSON.stringify({
                    poolIdentifier,
                    status: "unsubscribed",
                  }));
                } else {
                  ws.send(JSON.stringify({ error: "Invalid pool identifier" }));
                }
              } else {
                ws.send(JSON.stringify({ error: "Unknown action" }));
              }
            } catch (error) {
              if (error instanceof z.ZodError) {
                ws.send(
                  JSON.stringify({
                    error: "Invalid input parameters",
                    details: error.errors,
                  }),
                );
              } else {
                ws.send(JSON.stringify({ error: "Invalid message format" }));
              }
            }
          })();
        },
        onClose: (event, ws: WebSocketClient) => {
          // Remove client from all poolSubscriptions
          const clientPools = ws.raw && clientSubscriptions.get(ws.raw);
          if (clientPools) {
            for (const poolIdentifier of clientPools) {
              const poolSubscription = poolSubscriptions.get(poolIdentifier);
              if (poolSubscription) {
                const clientData = ws.raw && poolSubscription.clients.get(ws.raw);
                if (clientData && clientData.walletAddress) {
                  const walletAddrStr = clientData.walletAddress.toLowerCase();
                  const walletClientsSet = poolSubscription.walletClients.get(
                    walletAddrStr,
                  );
                  if (walletClientsSet) {
                    ws.raw && walletClientsSet.delete(ws.raw);
                    if (walletClientsSet.size === 0) {
                      poolSubscription.walletClients.delete(walletAddrStr);
                    }
                  }
                }
                ws.raw && poolSubscription.clients.delete(ws.raw);

                // If no clients left in poolSubscription, remove it
                if (poolSubscription.clients.size === 0) {
                  poolSubscriptions.delete(poolIdentifier);

                  // If no pools left on chain, unwatch the chain
                  const poolsOnChain = Array.from(
                    poolSubscriptions.values(),
                  ).filter((ps) => ps.chainId === poolSubscription.chainId);
                  if (poolsOnChain.length === 0) {
                    const chainWatcher = chainWatchers[poolSubscription.chainId];
                    if (chainWatcher) {
                      chainWatcher.unwatch();
                      delete chainWatchers[poolSubscription.chainId];
                    }
                  }
                }
              }
            }
            ws.raw && clientSubscriptions.delete(ws.raw);
          }
        },
      };
    }),
  )
  .get("/status", (c) => {
    // Collect system statistics
    const stats = {
      // Overall stats
      totalPoolSubscriptions: poolSubscriptions.size,
      totalUniqueClients: clientSubscriptions.size,
      activeChainWatchers: Object.keys(chainWatchers).length,

      // Chain-specific stats
      chainStats: Object.fromEntries(
        Object.keys(chainWatchers).map(chainId => {
          const poolsOnChain = Array.from(poolSubscriptions.values())
            .filter(ps => ps.chainId === Number(chainId));

          return [chainId, {
            totalPools: poolsOnChain.length,
            totalClients: poolsOnChain.reduce((acc, pool) => acc + pool.clients.size, 0),
            totalWalletSubscriptions: poolsOnChain.reduce(
              (acc, pool) => acc + pool.walletClients.size, 0
            ),
          }];
        })
      ),

      // Pool subscription details
      pools: Array.from(poolSubscriptions.entries()).map(([identifier, pool]) => ({
        identifier,
        chainId: pool.chainId,
        token0: pool.token0,
        token1: pool.token1,
        version: pool.version,
        connectedClients: pool.clients.size,
        walletSubscriptions: pool.walletClients.size,
        hasLastData: !!pool.lastData,
      })),

      // System timestamp
      timestamp: new Date().toISOString(),
    };

    return c.json(stats);
  });


const server = {
  app,
  websocket,
};

export default server;