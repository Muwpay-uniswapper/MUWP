import { describe, expect, test } from "bun:test";

const TOKEN_A = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const TOKEN_B = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const ACCOUNT = "0x492804D7740150378BE8d4bBF8ce012C5497DeA9";

function makeRoute(tokenAddress: string) {
	return { fromToken: { address: tokenAddress } };
}

describe("Allocation Mapper", () => {
	test("should handle single sender", async () => {
		const input: {
			routes: ReturnType<typeof makeRoute>[];
			from: Record<string, Record<string, bigint>>;
			gasPayer: string;
			account: string;
		} = {
			routes: [makeRoute(TOKEN_A)],
			from: { [TOKEN_A]: { "0x123ADDRESS": 150n } },
			gasPayer: "0x123ADDRESS",
			account: ACCOUNT,
		};

		const args = [
			input.routes.flatMap((route) =>
				Object.keys(input.from[route.fromToken.address]),
			),
			input.routes.map((route) => route.fromToken.address),
			input.routes.map(
				(route) => input.from[route.fromToken.address][input.gasPayer],
			),
			100n,
			input.account,
		] as const;

		expect(args[0].length).toBe(args[1].length);
		expect(args[0].length).toBe(args[2].length);

		expect(args[0][0]).toBe("0x123ADDRESS");
		expect(args[1][0]).toBe(TOKEN_A);
		expect(args[2][0]).toBe(150n);
		expect(args[3]).toBe(100n);
		expect(args[4]).toBe(ACCOUNT);
	});

	test("should handle multiple senders", async () => {
		const input: {
			routes: ReturnType<typeof makeRoute>[];
			from: Record<string, Record<string, bigint>>;
			gasPayer: string;
			account: string;
		} = {
			routes: [makeRoute(TOKEN_A), makeRoute(TOKEN_B)],
			from: {
				[TOKEN_A]: { "0x123ADDRESS0": 150n },
				[TOKEN_B]: { "0x123ADDRESS1": 300n },
			},
			gasPayer: "0x123ADDRESS1",
			account: ACCOUNT,
		};

		const args = [
			input.routes.flatMap((route) =>
				Object.keys(input.from[route.fromToken.address]),
			),
			input.routes.map((route) => route.fromToken.address),
			input.routes.flatMap((route) =>
				Object.values(input.from[route.fromToken.address]),
			),
			100n,
			input.account,
		] as const;

		expect(args[0].length).toBe(args[1].length);
		expect(args[0].length).toBe(args[2].length);

		expect(args[0][0]).toBe("0x123ADDRESS0");
		expect(args[0][args[0].length - 1]).toBe(
			`0x123ADDRESS${input.routes.length - 1}`,
		);
		expect(args[1][0]).toBe(TOKEN_A);
		expect(args[1][args[1].length - 1]).toBe(TOKEN_B);
		expect(args[2][0]).toBe(150n);
		expect(args[2][args[2].length - 1]).toBe(BigInt(150 * input.routes.length));
		expect(args[3]).toBe(100n);
		expect(args[4]).toBe(ACCOUNT);
	});
});
