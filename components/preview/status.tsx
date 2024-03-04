import { ArrowLeftRightIcon, Loader2, SendIcon, UnlockIcon } from "lucide-react";


export enum Status {
    approvals = "approvals",
    review = "review",
    send = "send",
}

export function PreviewStatus({
    status,
    needsApproval
}: {
    status: Status,
    needsApproval: string[]
}) {
    const loading = <Loader2 className="h-12 w-12 animate-spin absolute -left-3
                -top-3 text-blue-500/50" />

    return (
        <div className="flex flex-row items-center justify-between py-4">
            {needsApproval.length > 0 && <>
                <div className="flex gap-1 relative">
                    {status == Status.approvals && loading}
                    <UnlockIcon />
                    Approvals
                </div>

                <div className="w-1/3 border-t-2 border-dashed border-gray-300 mx-2"></div>
            </>}

            <div className="flex gap-1 relative">
                {status == Status.review && loading}
                <ArrowLeftRightIcon />
                Review
            </div>

            <div className="w-1/3 border-t-2 border-dashed border-gray-300 mx-2"></div>

            <div className="flex gap-1 relative">
                {status == Status.send && loading}
                <SendIcon />
                Send
            </div>
        </div>
    )
}
