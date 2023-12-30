import React, { memo, ReactNode, useContext } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Route, Token } from '@/lib/li.fi-ts';
import { formatUnits } from "viem";
import { ArrowDown, ChevronDown, Clock, DollarSign, Fuel } from 'lucide-react';
import { useRouteStore } from '@/lib/front/data/routeStore';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/front/utils';
import { format } from './DetailNode';
import { ChainIcon } from 'connectkit';

export type TokenNodeData = Token & {
    amounts: { [key: string]: string }
    isInput?: boolean;
    isSource?: boolean;
    source?: string; // Means isTarget
}

export default memo(({ data }: NodeProps<TokenNodeData>) => {
    const { routes, chosenIndex, choseIndex } = useRouteStore();
    const sum = Object.values(data.amounts).map((v) => BigInt(v)).reduce((a, b) => a + b, 0n);
    const formattedAmount = formatUnits(data.source ? BigInt(data.amounts[data.source]) : sum, data.decimals)

    return (
        <>
            <div className="cloud gradient">
                <div>
                    <ChainIcon id={data.chainId} />
                </div>
            </div>
            <div className="wrapper gradient">
                <div className="inner">
                    <div className="body">
                        <div className="icon"> <img src={data.logoURI} alt={data.symbol} className="w-4 h-4 rounded-full" /></div>
                        <div>
                            <div className="title">{data.name.length > 12 ? data.symbol : data.name}</div>
                            <div className="subline">{(!data.isInput && !data.isSource) && "~"}{formattedAmount.slice(0, 10)}</div>
                        </div>
                    </div>
                    {data.isInput && <Select value={chosenIndex[data.address]?.toString()} onValueChange={value => {
                        choseIndex(data.address, Number(value))
                    }}>
                        <SelectTrigger className="w-4 h-4 p-0 border-none bg-transparent" />
                        <SelectContent className="w-96">
                            {routes[data.address]?.map((route, index) => <SelectItem key={index} value={index.toString()} className='w-full'>
                                <RouteInfo route={route} index={index} />
                            </SelectItem>)}
                        </SelectContent>
                    </Select>
                    }
                    <Handle type="target" position={Position.Top} />
                    <Handle type="source" position={Position.Bottom} />
                </div>
            </div>
        </>
    );
});

export function RouteInfo({ route, index }: { route: Route, index: number }) {
    return <div className={cn("w-full relative p-4")}>
        {
            route.tags?.map((tag) => <Badge className="mr-1 mb-1">{tag}</Badge>)
        }
        <div className="flex flex-col items-center justify-center">
            {format(formatUnits(BigInt(route.fromAmount), route.fromToken.decimals))} {route.fromToken.symbol}
            <ArrowDown className="w-4 h-4" />
            {format(formatUnits(BigInt(route.toAmount), route.toToken.decimals))} {route.toToken.symbol}
        </div>
        <div className="flex flex-row items-center justify-around">
            <span className='flex flex-row items-center'><Fuel className='w-3 h-3 mr-1' /> {format(route.gasCostUSD)}$</span>
            <span className='flex flex-row items-center'><DollarSign className='w-3 h-3 mr-1' /> {
                format(route
                    .steps
                    .map(step => step.estimate?.feeCosts?.map(fee => Number(fee.amountUSD))
                        .reduce((acc, curr) => acc + curr, 0)
                    )
                    .reduce((acc, curr) => (acc ?? 0) + (curr ?? 0), 0))}$
            </span>
            <span className='flex flex-row items-center'><Clock className='w-3 h-3 mr-1' />
                {Math.ceil(
                    route.steps
                        .map((step) => step.estimate?.executionDuration ?? 0)
                        .reduce((duration, x) => duration + x, 0) / 60,
                )} min</span>
        </div>
    </div>
}