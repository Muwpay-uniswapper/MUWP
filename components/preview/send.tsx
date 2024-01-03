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
    const { isError, isLoading, error, isSuccess } = useWaitForTransaction({ hash });

    React.useEffect(() => {
        if (!isError && !isLoading && isSuccess) {
            setHash(undefined);
            nextStep();
        }
    }, [isError, isLoading, error, isSuccess])

    return <div>
        <div className="text-center pb-4">
            <Send className="inline w-8 h-8" />
            <div className="font-bold text-2xl mt-2 mb-4">Sending Transaction...</div>
        </div>
    </div>
}