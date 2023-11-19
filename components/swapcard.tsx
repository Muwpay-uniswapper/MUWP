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
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { TokenSelector } from '@/app/token'

export function SwapCard() {
    // const { isConnected } = useAccount();

    return <Card className={cn('md:w-4/12 relative')}>
        {/* {!isConnected && <div className="absolute top-0 w-full h-full backdrop-blur-sm z-50 opacity-0 hover:opacity-100 transition-all rounded flex justify-center items-center">
            <ConnectButton />
        </div>} */}
        <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            {/* {isConnected && <ConnectButton accountStatus="avatar" chainStatus="full" />} */}
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-2 w-full">
                <TokenSelector id='from-token' />
                <TokenSelector id='from-token' />
            </div>
        </CardContent>
    </Card>
}

