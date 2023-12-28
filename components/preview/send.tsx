import { useRouteStore } from "@/lib/front/data/routeStore";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
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
    const { tempAccount, routes: _route } = useRouteStore();
    const router = useRouter();
    const { chain } = useNetwork();
    const { isError, isLoading } = useWaitForTransaction({ hash })

    React.useEffect(() => {
        if (!hash) return;
        if (isError) {
            toast.error("Could not wait for transaction")
        }

        if (hash && !isLoading) {
            (async () => {

                let retries = 3;
                while (retries > 0) {
                    try {
                        const notifyBackend = await fetch("/api/receive-funds", {
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

                        if ((notifyBackend as any).status === "success") {
                            router.push("/transactions");
                            setTimeout(() => {
                                setHash(undefined);
                            }, 5000);
                            break;
                        } else {
                            retries--;
                            if (retries === 0) {
                                toast.error("Could not notify backend after several attempts")
                            }
                        }
                    } catch (err) {
                        retries--;
                        if (retries === 0) {
                            toast.error("Could not notify backend after several attempts")
                        }
                    } finally {
                        nextStep();
                    }
                }
            })();
        }
    }, [hash, isError, isLoading])

    return <div>
        <div className="text-center pb-4">
            <Send className="inline w-8 h-8" />
            <div className="font-bold text-2xl mt-2 mb-4">Sending Transaction...</div>
            <div>DO NOT CLOSE YOUR BROWSER!</div>
        </div>
    </div>
}