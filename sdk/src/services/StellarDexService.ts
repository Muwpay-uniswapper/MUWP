import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { StellarAsset } from "../types/api";

interface StellarSettings {
  horizonUrl: string;
  networkPassphrase: string;
}

export interface MarketOrderInput {
  selling: StellarAsset;
  amount: string;
  accountSecret: string;
  minPrice?: number;
  timeoutSeconds?: number;
}

export class StellarDexService {
  private readonly server: Horizon.Server;
  private readonly networkPassphrase: string;

  constructor(settings: StellarSettings) {
    this.server = new Horizon.Server(settings.horizonUrl);
    this.networkPassphrase = settings.networkPassphrase;
  }

  private toAsset(asset: StellarAsset) {
    if (asset.code === "XLM") {
      return Asset.native();
    }
    return new Asset(asset.code, asset.issuer);
  }

  async fetchOrderbook(input: {
    selling: StellarAsset;
    buying?: StellarAsset;
    limit?: number;
  }) {
    const sellingAsset = this.toAsset(input.selling);
    const buyingAsset = this.toAsset(input.buying ?? { code: "XLM", issuer: "" });
    const book = await this.server
      .orderbook(sellingAsset, buyingAsset)
      .limit(input.limit ?? 5)
      .call();
    return book;
  }

  async placeMarketOrder(input: MarketOrderInput) {
    const sellingAsset = this.toAsset(input.selling);
    const kp = Keypair.fromSecret(input.accountSecret);
    const account = await this.server.loadAccount(kp.publicKey());
    const orderbook = await this.fetchOrderbook({
      selling: input.selling,
      buying: { code: "XLM", issuer: "" },
      limit: 5,
    });
    const bestBid = orderbook.bids[0];
    if (!bestBid) {
      throw new Error("No bids available for the requested pair");
    }
    const price = input.minPrice ?? Number(bestBid.price);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.manageSellOffer({
          selling: sellingAsset,
          buying: Asset.native(),
          amount: input.amount,
          price: price.toString(),
        }),
      )
      .setTimeout(input.timeoutSeconds ?? 60)
      .build();
    tx.sign(kp);
    const res = await this.server.submitTransaction(tx);
    return {
      hash: res.hash,
      acceptedPrice: price,
    };
  }

  async swapToXlm(input: MarketOrderInput) {
    return this.placeMarketOrder(input);
  }
}

