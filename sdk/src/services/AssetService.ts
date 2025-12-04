import {
  AllbridgeCoreSdk,
  nodeRpcUrlsDefault,
  TokenWithChainDetails,
} from "@allbridge/bridge-core-sdk";
import {
  Asset,
  BASE_FEE,
  Keypair,
  Networks,
  Operation,
  Server,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

interface StellarSettings {
  horizonUrl: string;
  networkPassphrase: string;
}

export interface IssueAssetInput {
  assetCode: string;
  issuerSecret: string;
  distributionSecret: string;
  amount: string;
}

export interface TrustlineInput {
  assetCode: string;
  issuerPublicKey: string;
  accountSecret: string;
}

export class AssetService {
  private readonly server: Server;
  private readonly networkPassphrase: string;
  private allbridge?: AllbridgeCoreSdk;

  constructor(settings: StellarSettings, server?: Server) {
    this.server = server ?? new Server(settings.horizonUrl);
    this.networkPassphrase = settings.networkPassphrase;
  }

  private getAllbridge() {
    if (!this.allbridge) {
      this.allbridge = new AllbridgeCoreSdk(nodeRpcUrlsDefault);
    }
    return this.allbridge;
  }

  async ensureTrustline(input: TrustlineInput) {
    const kp = Keypair.fromSecret(input.accountSecret);
    const account = await this.server.loadAccount(kp.publicKey());
    const target = new Asset(input.assetCode, input.issuerPublicKey);
    const hasTrustline = account.balances.some(
      (balance) =>
        balance.asset_code === input.assetCode &&
        balance.asset_issuer === input.issuerPublicKey,
    );
    if (hasTrustline) {
      return target;
    }
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.changeTrust({
          asset: target,
        }),
      )
      .setTimeout(60)
      .build();
    tx.sign(kp);
    await this.server.submitTransaction(tx);
    return target;
  }

  async issueAsset(input: IssueAssetInput) {
    const issuer = Keypair.fromSecret(input.issuerSecret);
    const distributor = Keypair.fromSecret(input.distributionSecret);
    const asset = new Asset(input.assetCode, issuer.publicKey());
    await this.ensureTrustline({
      assetCode: input.assetCode,
      issuerPublicKey: issuer.publicKey(),
      accountSecret: input.distributionSecret,
    });
    const account = await this.server.loadAccount(issuer.publicKey());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: distributor.publicKey(),
          asset,
          amount: input.amount,
        }),
      )
      .setTimeout(60)
      .build();
    tx.sign(issuer);
    const result = await this.server.submitTransaction(tx);
    return { asset, hash: result.hash };
  }

  async getBalances(publicKey: string) {
    const account = await this.server.loadAccount(publicKey);
    return account.balances.map((balance) => ({
      assetCode: balance.asset_code ?? "XLM",
      assetIssuer: balance.asset_issuer,
      balance: balance.balance,
    }));
  }

  async lookupAllbridgeToken(params: {
    chainId: number;
    tokenAddress: string;
  }): Promise<TokenWithChainDetails> {
    const sdk = this.getAllbridge();
    const map = await sdk.chainDetailsMap();
    const match = Object.values(map)
      .flatMap((chain) =>
        chain.tokens.map((token) => ({
          token,
          chain,
        })),
      )
      .find(
        (entry) =>
          entry.chain.chainId &&
          Number(entry.chain.chainId) === params.chainId &&
          entry.token.tokenAddress.toLowerCase() ===
            params.tokenAddress.toLowerCase(),
      );
    if (!match) {
      throw new Error("Token not found in Allbridge registry");
    }
    return match.token;
  }
}

