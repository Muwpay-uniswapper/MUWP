import {
	Account,
	Address,
	BASE_FEE,
	Contract,
	Keypair,
	Networks,
	nativeToScVal,
	SorobanRpc,
	scValToNative,
	TransactionBuilder,
} from "@stellar/stellar-sdk";
import type {
	CancelSubscriptionParams,
	CreateSubscriptionParams,
	Subscription,
	TriggerPaymentParams,
} from "../types/subscription";

export interface SorobanSubscriptionServiceOptions {
	sorobanUrl: string;
	networkPassphrase?: string;
}

export class SorobanSubscriptionService {
	private readonly server: SorobanRpc.Server;
	private readonly networkPassphrase: string;

	constructor(options: SorobanSubscriptionServiceOptions) {
		this.server = new SorobanRpc.Server(options.sorobanUrl, {
			allowHttp: options.sorobanUrl.startsWith("http://"),
		});
		this.networkPassphrase = options.networkPassphrase ?? Networks.TESTNET;
	}

	async createSubscription(params: CreateSubscriptionParams): Promise<number> {
		const kp = Keypair.fromSecret(params.callerSecret);
		const contract = new Contract(params.contractId);
		const account = await this.server.getAccount(kp.publicKey());

		const tx = new TransactionBuilder(account, {
			fee: BASE_FEE,
			networkPassphrase: this.networkPassphrase,
		})
			.addOperation(
				contract.call(
					"create",
					new Address(kp.publicKey()).toScVal(),
					new Address(params.token).toScVal(),
					new Address(params.recipient).toScVal(),
					nativeToScVal(params.amount, { type: "i128" }),
					nativeToScVal(params.intervalSeconds, { type: "u64" }),
				),
			)
			.setTimeout(30)
			.build();

		const sim = await this.server.simulateTransaction(tx);
		if (SorobanRpc.Api.isSimulationError(sim)) {
			throw new Error(`Simulation failed: ${sim.error}`);
		}

		const assembled = SorobanRpc.assembleTransaction(tx, sim).build();
		assembled.sign(kp);

		const result = await this.server.sendTransaction(assembled);
		await this.waitForConfirmation(result.hash);

		const getResult = await this.server.getTransaction(result.hash);
		if (getResult.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
			throw new Error("createSubscription transaction failed");
		}
		if (!getResult.returnValue) {
			throw new Error("No return value from createSubscription");
		}
		return scValToNative(getResult.returnValue) as number;
	}

	async triggerPayment(params: TriggerPaymentParams): Promise<string> {
		const kp = Keypair.fromSecret(params.callerSecret);
		const contract = new Contract(params.contractId);
		const account = await this.server.getAccount(kp.publicKey());

		const tx = new TransactionBuilder(account, {
			fee: BASE_FEE,
			networkPassphrase: this.networkPassphrase,
		})
			.addOperation(
				contract.call(
					"trigger",
					nativeToScVal(params.subscriptionId, { type: "u64" }),
				),
			)
			.setTimeout(30)
			.build();

		const sim = await this.server.simulateTransaction(tx);
		if (SorobanRpc.Api.isSimulationError(sim)) {
			throw new Error(`Simulation failed: ${sim.error}`);
		}

		const assembled = SorobanRpc.assembleTransaction(tx, sim).build();
		assembled.sign(kp);

		const result = await this.server.sendTransaction(assembled);
		await this.waitForConfirmation(result.hash);
		return result.hash;
	}

	async cancelSubscription(params: CancelSubscriptionParams): Promise<string> {
		const kp = Keypair.fromSecret(params.subscriberSecret);
		const contract = new Contract(params.contractId);
		const account = await this.server.getAccount(kp.publicKey());

		const tx = new TransactionBuilder(account, {
			fee: BASE_FEE,
			networkPassphrase: this.networkPassphrase,
		})
			.addOperation(
				contract.call(
					"cancel",
					nativeToScVal(params.subscriptionId, { type: "u64" }),
				),
			)
			.setTimeout(30)
			.build();

		const sim = await this.server.simulateTransaction(tx);
		if (SorobanRpc.Api.isSimulationError(sim)) {
			throw new Error(`Simulation failed: ${sim.error}`);
		}

		const assembled = SorobanRpc.assembleTransaction(tx, sim).build();
		assembled.sign(kp);

		const result = await this.server.sendTransaction(assembled);
		await this.waitForConfirmation(result.hash);
		return result.hash;
	}

	async getSubscription(
		contractId: string,
		subscriptionId: number,
	): Promise<Subscription> {
		const contract = new Contract(contractId);
		const dummyKp = Keypair.random();
		const account = new Account(dummyKp.publicKey(), "0");

		const tx = new TransactionBuilder(account, {
			fee: BASE_FEE,
			networkPassphrase: this.networkPassphrase,
		})
			.addOperation(
				contract.call("get", nativeToScVal(subscriptionId, { type: "u64" })),
			)
			.setTimeout(30)
			.build();

		const sim = await this.server.simulateTransaction(tx);
		if (SorobanRpc.Api.isSimulationError(sim)) {
			throw new Error(`Simulation failed: ${sim.error}`);
		}
		if (!sim.result?.retval) {
			throw new Error("No return value from get()");
		}

		const raw = scValToNative(sim.result.retval) as Record<string, unknown>;
		return {
			id: subscriptionId,
			subscriber: raw.subscriber as string,
			token: raw.token as string,
			recipient: raw.recipient as string,
			amount: BigInt(raw.amount as string),
			interval: Number(raw.interval),
			nextPayment: Number(raw.next_payment),
			active: Boolean(raw.active),
		};
	}

	private async waitForConfirmation(
		hash: string,
		maxAttempts = 20,
	): Promise<void> {
		for (let i = 0; i < maxAttempts; i++) {
			const result = await this.server.getTransaction(hash);
			if (
				result.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS ||
				result.status === SorobanRpc.Api.GetTransactionStatus.FAILED
			) {
				return;
			}
			await new Promise((r) => setTimeout(r, 1000));
		}
		throw new Error(`Transaction ${hash} not confirmed after ${maxAttempts}s`);
	}
}
