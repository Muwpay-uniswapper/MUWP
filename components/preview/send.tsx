import { useRouteStore } from "@/lib/core/data/routeStore";
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

    const [debug, setDebug] = React.useState(false);

    //Listen for the 'Alt' key press
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.altKey) {
                setDebug(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        //Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };

    }, []);

    const debugNotifyBackend = async () => {
        // Copied from the effect below 
        // You may want to extract this into a function to reuse
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
    };

    React.useEffect(() => {
        if (!isError && !isLoading && isSuccess) {
            debugNotifyBackend();
        }
    }, [isError, isLoading, error, isSuccess])

    return <div>
        <div className="text-center pb-4">
            <Send className="inline w-8 h-8" />
            <div className="font-bold text-2xl mt-2 mb-4">Sending Transaction...</div>
            {debug && (
                <button onClick={debugNotifyBackend}>Debug Notify Backend</button>
            )}
        </div>
    </div>
}