import React, { memo, ReactNode } from 'react';
import { Handle, NodeProps, Position, useEdgesState, useNodesState, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import { FiCloud } from 'react-icons/fi';
import { FeeCost, GasCost, Step, Token } from '@/lib/li.fi-ts';
import { formatUnits } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';
import { useRouteStore } from '@/lib/front/data/routeStore';

export type DetailNodeData = Step & {
    edgeId: string;
}

export default memo(({ data }: NodeProps<DetailNodeData>) => {

    const { setFocused } = useRouteStore();
    const updateNodes = useUpdateNodeInternals();

    const { setCenter, fitView, setNodes, getNodes, getEdge, setEdges } = useReactFlow();

    const format = (n?: number | string) => {
        if (!n) return "?";
        if (typeof n === "number") {
            return Math.round(n * 1000) / 1000;
        }
        const [a, b] = n.split(".");
        return `${a}.${b.slice(0, 3)}`;
    }

    return (
        <Card>
            <CardHeader className="relative">
                <X className="cursor-pointer bg-black/50 p-1 rounded-full absolute right-2 top-2" onClick={() => {
                    const nodes = getNodes()
                    const edge = getEdge(data.edgeId) ?? null
                    setFocused(nodes, edge, setNodes, setEdges, setCenter, fitView);
                    updateNodes(nodes.map((node) => node.id));
                }} />
                <CardTitle>Details</CardTitle>
                <CardDescription>{data.action.fromToken.symbol} to {data.action.toToken.symbol} on {data.tool}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
                <p>Slippage</p>
                <p className="text-right">{format((data.action.slippage ?? 0) * 100)}%</p>
                <p>Fees</p>
                <p className="text-right">
                    {
                        format(
                            data
                                .estimate
                                ?.feeCosts
                                ?.map((fee: FeeCost) => Number(fee.amountUSD))
                                .reduce((a: number, b: number) => a + b, 0)
                        )}$
                </p>
                <p>Gas Fees</p>
                <p className="text-right">
                    {
                        format(
                            data
                                .estimate
                                ?.gasCosts
                                ?.map((fee: GasCost) => Number(fee.amountUSD))
                                .reduce((a: number, b: number) => a + b, 0)
                        )}$
                </p>
                <p>Minimum Received</p>
                <p className="text-right">{format(formatUnits(BigInt(data.estimate?.toAmountMin ?? ""), data.action.toToken.decimals))}</p>
            </CardContent>
        </Card>
    );
});
