import React, { FC } from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, useReactFlow, getBezierPath } from 'reactflow';
import { GradientIdContext } from './provider';
import { UnfoldHorizontal } from 'lucide-react';
import { ToolDetails } from '@/lib/li.fi-ts/models/ToolDetails';

const EdgeExchange: FC<EdgeProps> = ({
    id,
    style,
    sourceX,
    sourceY,
    targetX,
    targetY,
    source,
    target,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
}) => {
    const { getNode } = useReactFlow();
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <path
                id={id}
                style={{
                    ...style,
                    // stroke: `url(#${gradientId})`,
                    stroke: "#9E59FE",
                    transition: "all 0.5s ease-in-out, opacity 0.2s ease-in-out",
                }}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        transition: "all 0.5s ease-in-out, opacity 0.2s ease-in-out",
                        pointerEvents: "all",
                        padding: 10,
                        borderRadius: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        ...style,
                    }}
                    className="nodrag nopan react-flow__controls cursor-pointer"
                    onClick={focus}
                >
                    <img src={(data.toolDetails as ToolDetails).logoURI} className='inline w-4 h-4 mr-1' />
                    {data.toolDetails.name}{getNode(source)?.data.chainId !== getNode(target)?.data.chainId && <UnfoldHorizontal className='inline ml-1' />}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default EdgeExchange;
