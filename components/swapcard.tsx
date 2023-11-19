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

import { TokenSelector } from '@/app/token'

export function SwapCard({ chain }: { chain?: number }) {
    return <Card className={cn('md:w-4/12 relative')}>
        <ConnectButton not asChild className="absolute top-0 w-full h-full backdrop-blur-sm z-50 opacity-0 hover:opacity-100 transition-all rounded flex justify-center items-center" />
        <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <ConnectButton accountStatus="avatar" chainStatus="full" />
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                <TokenSelector id='from-token' chain={chain} />
            </div>
        </CardContent>
    </Card>
}

