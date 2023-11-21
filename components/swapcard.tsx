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
import { TokenSelector, ChainSelector } from '@/app/token'
import { Separator } from "./ui/separator"

export function SwapCard({ chain }: { chain?: number }) {
    return <Card className={cn('md:w-4/12 relative mx-4')}>
        <ConnectButton not asChild className="absolute top-0 w-full h-full backdrop-blur-sm z-50 opacity-0 hover:opacity-100 transition-all rounded flex justify-center items-center" />
        <CardHeader>
            <CardTitle>Swap</CardTitle>
            <CardDescription>Choose 1 or more input tokens to swap to the destination token.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-row">
                <ChainSelector mode="input" />
                <ConnectButton />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full mt-8">
                <TokenSelector id='from-token' chain={chain} mode="input" />
            </div>
            <Separator className="flex justify-center mt-8">
                <ArrowDown className="text-white -translate-y-1/2 bg-card" />
            </Separator>
            <div className="grid grid-cols-1 gap-4 w-full mt-8">
                <ChainSelector mode="output" />
                <TokenSelector id='to-token' chain={chain} mode="output" />
            </div>
        </CardContent>
    </Card>
}

