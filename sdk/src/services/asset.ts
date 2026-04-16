import {
  AllbridgeCoreSdk,
  ChainSymbol,
  nodeRpcUrlsDefault,
  type ChainDetailsWithTokens,
  type TokenWithChainDetails
} from "@allbridge/bridge-core-sdk";
import {
  Address,
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  Operation,
  Memo,
  SorobanRpc,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";
function formatUnits(value: bigint, decimals: number): string {
  const s = value.toString().padStart(decimals + 1, "0");
  const integer = s.slice(0, s.length - decimals);
  const fraction = s.slice(s.length - decimals);
  return fraction ? `${integer}.${fraction}` : integer;
}

function parseUnits(value: string, decimals: number): bigint {
  const [integer = "0", fraction = ""] = value.split(".");
  const padded = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(integer + padded);
}

export interface StellarAssetServiceOptions {
  horizonUrl?: string;
  sorobanUrl?: string;
  networkPassphrase?: string;
  rpcUrls?: Record<string, string>;
  defaultTimeoutSeconds?: number;
}

export interface BridgePairMetadata {
  sourceToken: TokenWithChainDetails;
  destinationToken: TokenWithChainDetails;
  sourceChain: ChainDetailsWithTokens;
  destinationChain: ChainDetailsWithTokens;
}

export interface BridgeEstimate {
  expectedAmount: bigint;
  expectedAmountReadable: string;
  metadata: BridgePairMetadata;
}

export interface TrustlineParams {
  account: string;
  assetCode: string;
  issuer: string;
  limit?: string;
  fee?: string;
  timeoutInSeconds?: number;
}

export interface IssuanceParams {
  issuerSecret: string;
  destination: string;
  assetCode: string;
  amount: string;
  memo?: string;
  fee?: string;
  timeoutInSeconds?: number;
}

export interface BalanceSummary {
  assetCode: string;
  assetIssuer?: string;
  assetType: string;
  balance: string;
  limit?: string;
  isNative: boolean;
}

export interface AssetDescriptor {
  assetCode: string;
  issuer: string;
  decimals: number;
  bridge: BridgePairMetadata;
}

export interface SorobanBalance {
  raw: string;
  decoded?: string;
  latestLedger?: number;
}

const DEFAULT_TRUST_LIMIT = "922337203685.4775807";

export class StellarAssetService {
  protected readonly sdk: AllbridgeCoreSdk;
  protected readonly horizon: Horizon.Server;
  protected readonly soroban?: SorobanRpc.Server;
  protected readonly networkPassphrase: string;
  protected readonly defaultTimeout: number;
  private chainDetails?: Promise<Record<string, ChainDetailsWithTokens>>;
  private chainIdLookup?: Promise<Record<number, ChainSymbol>>;

  constructor(options: StellarAssetServiceOptions = {}) {
    this.sdk = new AllbridgeCoreSdk(options.rpcUrls ?? nodeRpcUrlsDefault);
    this.horizon = new Horizon.Server(options.horizonUrl ?? "https://horizon.stellar.org");
    this.networkPassphrase = options.networkPassphrase ?? Networks.PUBLIC;
    this.defaultTimeout = options.defaultTimeoutSeconds ?? 180;
    this.soroban = options.sorobanUrl
      ? new SorobanRpc.Server(options.sorobanUrl, { allowHttp: options.sorobanUrl.startsWith("http://") })
      : undefined;
  }

  async resolveBridgePair(params: {
    fromChainId: number;
    fromTokenAddress: string;
    toChain?: ChainSymbol;
  }): Promise<BridgePairMetadata> {
    const [details, idLookup] = await Promise.all([
      this.getChainDetails(),
      this.getChainIdLookup()
    ]);
    const fromSymbol = idLookup[params.fromChainId];
    if (!fromSymbol) {
      throw new Error(`No Allbridge mapping for chain ${params.fromChainId}`);
    }
    const toSymbol = params.toChain ?? ChainSymbol.STLR;
    const sourceChain = details[fromSymbol];
    const destinationChain =
      details[toSymbol] ?? details[ChainSymbol.SRB] ?? details[ChainSymbol.STLR];
    if (!sourceChain || !destinationChain) {
      throw new Error("Missing Allbridge chain metadata");
    }
    const sourceToken = this.findToken(sourceChain, params.fromTokenAddress);
    if (!sourceToken) {
      throw new Error("Unsupported token pair for Allbridge");
    }
    const destinationToken = this.locateDestinationToken(destinationChain, sourceToken.symbol);
    if (!destinationToken) {
      throw new Error("Unsupported token pair for Allbridge");
    }
    return {
      sourceToken,
      destinationToken,
      sourceChain,
      destinationChain
    };
  }

  async describeAsset(params: {
    fromChainId: number;
    fromTokenAddress: string;
    issuer: string;
    assetCode?: string;
  }): Promise<AssetDescriptor> {
    const bridge = await this.resolveBridgePair(params);
    const assetCode =
      params.assetCode ??
      bridge.destinationToken.symbol ??
      bridge.sourceToken.symbol ??
      bridge.destinationToken.tokenAddress.slice(2, 6).toUpperCase();
    return {
      assetCode,
      issuer: params.issuer,
      decimals: bridge.destinationToken.decimals ?? 7,
      bridge
    };
  }

  async estimateBridgeAmount(params: {
    fromChainId: number;
    fromTokenAddress: string;
    amount: bigint;
  }): Promise<BridgeEstimate> {
    const metadata = await this.resolveBridgePair(params);
    const formatted = formatUnits(params.amount, metadata.sourceToken.decimals);
    const expected = await this.sdk.getAmountToBeReceived(
      formatted,
      metadata.sourceToken,
      metadata.destinationToken
    );
    const expectedAmount = parseUnits(expected, metadata.destinationToken.decimals);
    return {
      expectedAmount,
      expectedAmountReadable: expected,
      metadata
    };
  }

  async buildTrustlineTransaction(params: TrustlineParams) {
    const account = await this.horizon.loadAccount(params.account);
    const builder = new TransactionBuilder(account, {
      fee: params.fee ?? BASE_FEE,
      networkPassphrase: this.networkPassphrase
    })
      .setTimeout(params.timeoutInSeconds ?? this.defaultTimeout)
      .addOperation(
        Operation.changeTrust({
          asset: new Asset(params.assetCode, params.issuer),
          limit: params.limit ?? DEFAULT_TRUST_LIMIT
        })
      );
    const tx = builder.build();
    return tx.toXDR();
  }

  async buildIssuanceTransaction(params: IssuanceParams) {
    const issuer = Keypair.fromSecret(params.issuerSecret);
    const account = await this.horizon.loadAccount(issuer.publicKey());
    const builder = new TransactionBuilder(account, {
      fee: params.fee ?? BASE_FEE,
      networkPassphrase: this.networkPassphrase
    })
      .setTimeout(params.timeoutInSeconds ?? this.defaultTimeout)
      .addOperation(
        Operation.payment({
          destination: params.destination,
          asset: new Asset(params.assetCode, issuer.publicKey()),
          amount: params.amount
        })
      );
    if (params.memo) {
      builder.addMemo(Memo.text(params.memo));
    }
    const built = builder.build();
    built.sign(issuer);
    return built.toXDR();
  }

  async fetchBalances(account: string): Promise<BalanceSummary[]> {
    const res = await this.horizon.loadAccount(account);
    return res.balances.map((bal) => {
      if (bal.asset_type === "native") {
        return { assetCode: "XLM", assetIssuer: undefined, assetType: bal.asset_type, balance: bal.balance, limit: undefined, isNative: true };
      }
      if (bal.asset_type === "liquidity_pool_shares") {
        return { assetCode: "LP", assetIssuer: undefined, assetType: bal.asset_type, balance: bal.balance, limit: undefined, isNative: false };
      }
      return {
        assetCode: bal.asset_code,
        assetIssuer: bal.asset_issuer,
        assetType: bal.asset_type,
        balance: bal.balance,
        limit: bal.limit,
        isNative: false,
      };
    });
  }

  async fetchSorobanBalance(contractId: string, account: string): Promise<SorobanBalance> {
    if (!this.soroban) {
      throw new Error("Soroban RPC client is not configured");
    }
    const key = xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol("BALANCE"),
      xdr.ScVal.scvAddress(Address.fromString(account).toScAddress())
    ]);
    const entry = await this.soroban.getContractData(contractId, key) as unknown as {
      val?: xdr.ScVal;
      latestLedger?: number;
    };
    return {
      raw: entry.val?.toXDR("base64") ?? "",
      decoded: this.decodeBalance(entry.val),
      latestLedger: entry.latestLedger
    };
  }

  private decodeBalance(value?: xdr.ScVal | null) {
    if (!value) {
      return undefined;
    }
    if (value.switch().name === "scvI128") {
      const parts = value.i128();
      const hi = BigInt(parts.hi().toString());
      const lo = BigInt(parts.lo().toString());
      const magnitude = (hi << 64n) + (lo & ((1n << 64n) - 1n));
      return magnitude.toString();
    }
    return undefined;
  }

  private async getChainDetails() {
    if (!this.chainDetails) {
      this.chainDetails = this.sdk.chainDetailsMap();
    }
    return this.chainDetails;
  }

  private async getChainIdLookup() {
    if (!this.chainIdLookup) {
      this.chainIdLookup = this.buildChainIdLookup();
    }
    return this.chainIdLookup;
  }

  private async buildChainIdLookup() {
    const details = await this.getChainDetails();
    const lookup: Record<number, ChainSymbol> = {};
    Object.entries(details).forEach(([symbol, chain]) => {
      const numeric = this.normalizeChainId(chain);
      if (typeof numeric !== "undefined") {
        lookup[numeric] = symbol as ChainSymbol;
      }
    });
    return lookup;
  }

  private normalizeChainId(chain: ChainDetailsWithTokens) {
    if (chain.chainId) {
      const raw = chain.chainId.startsWith("0x")
        ? Number.parseInt(chain.chainId.slice(2), 16)
        : Number(chain.chainId);
      return Number.isNaN(raw) ? undefined : raw;
    }
    if (chain.allbridgeChainId) {
      const fallback = Number(chain.allbridgeChainId);
      return Number.isNaN(fallback) ? undefined : fallback;
    }
    return undefined;
  }

  private findToken(chain: ChainDetailsWithTokens, address: string) {
    return chain.tokens.find(
      (token) => token.tokenAddress.toLowerCase() === address.toLowerCase()
    );
  }

  private locateDestinationToken(chain: ChainDetailsWithTokens, symbol?: string) {
    if (symbol) {
      const match = chain.tokens.find((token) => token.symbol === symbol);
      if (match) {
        return match;
      }
    }
    return chain.tokens[0];
  }
}

