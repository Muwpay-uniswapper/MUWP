import React, { memo, ReactNode } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { FiCloud } from 'react-icons/fi';
import { Token } from '@/lib/li.fi-ts';
import { formatUnits } from "viem";

export type TokenNodeData = Token & {
    amount: string;
    isInput?: boolean;
}

export default memo(({ data }: NodeProps<TokenNodeData>) => {
    const formattedAmount = formatUnits(BigInt(data.amount), data.decimals)
    return (
        <>
            <div className="cloud gradient">
                <div>
                    {data.chainId}
                </div>
            </div>
            <div className="wrapper gradient">
                <div className="inner">
                    <div className="body">
                        <div className="icon"> <img src={data.logoURI} alt={data.symbol} className="w-4 h-4 rounded-full" /></div>
                        <div>
                            <div className="title">{data.name.length > 12 ? data.symbol : data.name}</div>
                            <div className="subline">{!data.isInput && "~"}{formattedAmount.slice(0, 10)}</div>
                        </div>
                    </div>
                    <Handle type="target" position={Position.Top} />
                    <Handle type="source" position={Position.Bottom} />
                </div>
            </div>
        </>
    );
});
