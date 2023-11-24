import { Suspense } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/front/utils'
import { ConnectButton } from '@/components/connectbutton'
import { ArrowDown } from "lucide-react"
import { TokenSelector, ChainSelector } from '@/components/dataFetch'
import { Separator } from "./ui/separator"
import { TokenLoader } from "./tokens/token_loader";
import { ChainLoader } from "./chains/chain-loader";
import { SwapButton } from "./layout/swapButton";

export function SwapCard({ chain, toChain }: { chain?: string, toChain?: string }) {
    return <Card className={cn('md:w-4/12 relative mx-4')}>
        <ConnectButton not asChild className="absolute top-0 w-full h-full backdrop-blur-sm z-50 opacity-0 hover:opacity-100 transition-all rounded flex justify-center items-center" />
        <CardHeader>
            <CardTitle>Swap</CardTitle>
            <CardDescription>Choose 1 or more input tokens to swap to the destination token.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-row gap-2">
                <Suspense fallback={<ChainLoader />}>
                    <ChainSelector mode="input" />
                </Suspense>
                <ConnectButton />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full mt-8">
                <Suspense fallback={<TokenLoader />}>
                    <TokenSelector id='from-token' chain={chain ? parseInt(chain) : undefined} mode="input" />
                </Suspense>
            </div>
            <Separator className="mt-8">
                <ArrowDown className="text-white -translate-y-1/2 mx-2" />
            </Separator>
            <div className="grid grid-cols-1 gap-4 w-full mt-8 mb-4">
                <Suspense fallback={<ChainLoader />}>
                    <ChainSelector mode="output" />
                </Suspense>
                <Suspense fallback={<TokenLoader />}>
                    <TokenSelector id='to-token' chain={toChain ? parseInt(toChain) : undefined} mode="output" />
                </Suspense>
            </div>
            <SwapButton />
        </CardContent>
    </Card>
}

