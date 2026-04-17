"use client";

import { Bridge } from "@muwp/lifi-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Check, X } from "lucide-react";
import { useSwapStore } from "@/lib/core/data/swapStore";
import { cn } from "@/lib/core/utils";

export function BridgesList({
    bridges
}: {
    bridges: Bridge[]
}) {
    const { allowDenyBridges, toggleAllowDenyBridge } = useSwapStore()

    return <Card className="max-h-fit">
        <CardHeader>
            <CardTitle>Tools</CardTitle>
            <CardDescription>By default, all bridges and exchanges are enabled. You can disable some if you want.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-4 gap-4">
                {bridges.map((bridge) => (
                    <div
                        className={cn(
                            "border border-white rounded w-24 h-24 flex flex-col justify-center items-center cursor-pointer hover:bg-white/20 relative",
                            allowDenyBridges.deny?.includes(bridge.key ?? "") ? "border-gray-500" : ""
                        )}
                        onClick={() => {
                            toggleAllowDenyBridge(bridge.key ?? "")
                        }}
                        key={bridge.key}
                    >
                        {allowDenyBridges.deny?.includes(bridge.key ?? "")
                            ? <X className="absolute -top-2 -right-2 w-5 h-5 p-1 bg-red-400 rounded-full" />
                            : <Check className="absolute -top-2 -right-2 w-5 h-5 p-1 bg-green-400 rounded-full" />}
                        <img src={bridge?.logoURI} alt={bridge.name} className={cn(
                            "w-8 h-8 rounded-full",
                            allowDenyBridges.deny?.includes(bridge.key ?? "") ? "filter grayscale opacity-50" : ""
                        )} />
                        <div className="text-sm text-white/75 text-center h-6">{bridge.name}</div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
}