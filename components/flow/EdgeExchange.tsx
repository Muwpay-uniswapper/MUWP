import React, { FC } from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, useReactFlow } from 'reactflow';
import { GradientIdContext } from './provider';

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
    const gradientId = React.useContext(GradientIdContext);

    const [edgePath, labelX, labelY] = getSmoothStepPath({
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
                    transition: "all 0.2s ease-in-out",
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
                        transition: "all 0.2s ease-in-out",
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
                    {data.label}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default EdgeExchange;
