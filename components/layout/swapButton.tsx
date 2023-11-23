"use client";

import { useSwapStore } from "@/lib/front/data/swapStore";
import { Button } from "../ui/button";
import { useAccount, useNetwork } from "wagmi";
import { InputType } from "@/app/api/quote/route";

declare global {
    interface BigInt {
        toJSON(): string;
    }
}

BigInt.prototype.toJSON = function () {
    return this.toString();
};

export function SwapButton() {
    const { inputTokens, outputToken, inputAmount, outputChain } = useSwapStore();
    const { chain } = useNetwork();
    const { address } = useAccount();

    const onClick = async () => {
        const quote = await fetch('/api/quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputTokens: inputTokens.map(t => ({ address: t.address, value: t.value })),
                outputToken: { address: outputToken?.address, value: outputToken?.value },
                inputAmount,
                outputChain,
                inputChain: chain?.id,
                fromAddress: address,
            } as InputType)
        }).then(res => res.json());

        console.log(quote);
    }

    return <Button className="w-full h-full rounded flex justify-center items-center" onClick={onClick}>
        Find Routes
    </Button>
}