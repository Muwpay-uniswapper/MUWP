import { test, expect, describe } from "bun:test"
import { zocker } from "zocker";
import { InputInitiate } from "./route";

describe("Allocation Mapper", () => {
    test("should handle single sender", async () => {
        const input = zocker(InputInitiate)
            .array({ min: 1, max: 1 })
            .generate();

        input.from = {
            [input.routes[0].fromToken.address]: {
                "0x123ADDRESS": 150n
            }
        };

        input.gasPayer = "0x123ADDRESS";

        /*
        // For Gas Payer
        function transfer(
        address[] memory sender,
        address[] memory tokens,
        uint256[] memory amounts,
        uint256 totalGas,
        address recipient
        ) public payable
                */
        const args = [
            input.routes.map(route => Object.keys(input.from[route.fromToken.address])).flat(),
            input.routes.map(route => route.fromToken.address),
            input.routes.map(route => input.from[route.fromToken.address][input.gasPayer]),
            100n,
            input.account,
        ] as const

        // All three should have the same length
        expect(args[0].length).toBe(args[1].length);
        expect(args[0].length).toBe(args[2].length);

        // We should have something like this:
        // [
        //     ["0x123ADDRESS"],
        //     [<fromTokenAddress>],
        //     [150n],
        //     100n,
        //     <account>
        // ]
        expect(args[0][0]).toBe("0x123ADDRESS");
        expect(args[1][0]).toBe(input.routes[0].fromToken.address);
        expect(args[2][0]).toBe(150n);
        expect(args[3]).toBe(100n);
        expect(args[4]).toBe(input.account);
    });

    test("should handle multiple senders", async () => {
        const input = zocker(InputInitiate)
            .array({ min: 1, max: 2 }) // changing parameters here to generate multiple routes (hence, multiple senders)
            .generate();

        // assigning different amounts to different addresses
        input.from = input.routes.reduce((acc, route, index) => {
            acc[route.fromToken.address] = {
                [`0x123ADDRESS${index}`]: BigInt(150 * (index + 1)) // each sender sending different amounts
            }
            return acc;
        }, {});

        input.gasPayer = "0x123ADDRESS1"; // assigning one of the addresses as the gas payer

        // similar to the previous test, however now we have multiple routes (and therefore multiple senders)
        const args = [
            input.routes.map(route => Object.keys(input.from[route.fromToken.address])).flat(),
            input.routes.map(route => route.fromToken.address),
            input.routes.map(route => Object.values(input.from[route.fromToken.address])).flat(),
            100n,
            input.account,
        ] as const

        // All three should have the same length
        expect(args[0].length).toBe(args[1].length);
        expect(args[0].length).toBe(args[2].length);

        // Since there are multiple values, we check the first and last sender
        expect(args[0][0]).toBe("0x123ADDRESS0");
        expect(args[0][args[0].length - 1]).toBe(`0x123ADDRESS${input.routes.length - 1}`);
        expect(args[1][0]).toBe(input.routes[0].fromToken.address);
        expect(args[1][args[1].length - 1]).toBe(input.routes[input.routes.length - 1].fromToken.address);
        expect(args[2][0]).toBe(150n); // the first sender sends 150n
        expect(args[2][args[2].length - 1]).toBe(BigInt(150 * input.routes.length)); // the last sender sends a higher amount, according to the pattern
        expect(args[3]).toBe(100n);
        expect(args[4]).toBe(input.account);
    });
});