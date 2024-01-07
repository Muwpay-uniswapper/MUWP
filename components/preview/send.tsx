import { useRouteStore } from "@/lib/front/data/routeStore";
import { Send } from "lucide-react";
import React from "react";
import { useNetwork, useWaitForTransaction } from "wagmi";
import { NextStep } from "./process";

export function PreviewSend({
    hash,
    setHash,
    nextStep
}: {
    hash: `0x${string}`,
    setHash: (hash: string | undefined) => void,
    nextStep: NextStep
}) {
    const { tempAccount, transactions, setTransaction } = useRouteStore();
    const { chain } = useNetwork();
    const { isError, isLoading, error, isSuccess } = useWaitForTransaction({ hash });

    React.useEffect(() => {
        if (!isError && !isLoading && isSuccess) {
            (async () => {
                const notifyBackend = await fetch("/api/chain-confirmed", {
                    method: "POST",
                    body: JSON.stringify({
                        chainId: chain?.id,
                        transactionHash: hash,
                        accountAddress: tempAccount
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then((res) => res.json());

                console.log(`Backend notified: ${notifyBackend.status}`)

                if ((notifyBackend as any).status === "success") {
                    const tx = transactions.find((transaction) => transaction.id == tempAccount);
                    if (tx) {
                        setTransaction({
                            ...tx,
                            timestamp: Date.now(), // Reset date
                        })
                    }

                    setHash(undefined);
                    nextStep();
                }
            })()
        }
    }, [isError, isLoading, error, isSuccess])

    return <div>
        <div className="text-center pb-4">
            <Send className="inline w-8 h-8" />
            <div className="font-bold text-2xl mt-2 mb-4">Sending Transaction...</div>
        </div>
    </div>
}