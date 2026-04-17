import React from "react";
import { Position, getSimpleBezierPath } from "reactflow";

export const Funnel = ({ height = 4, reverse = false }: { height: number, reverse: boolean }) => {
    const topBezier = getSimpleBezierPath({
        sourceX: 1,
        sourceY: reverse ? 5 : 1,
        sourcePosition: reverse ? Position.Left : Position.Right,
        targetX: 18,
        targetY: reverse ? 1 : 5,
        targetPosition: reverse ? Position.Right : Position.Left
    });

    const bottomBezier = getSimpleBezierPath({
        sourceX: 1,
        sourceY: reverse ? 5 : 9,
        sourcePosition: reverse ? Position.Left : Position.Right,
        targetX: 18,
        targetY: reverse ? 9 : 5,
        targetPosition: reverse ? Position.Right : Position.Left
    });

    return (
        <div className="w-32" style={{ height: `${height}rem` }}>
            <svg viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d={topBezier[0]} stroke="#2ACB42" strokeWidth="2" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={bottomBezier[0]} stroke="#2ACB42" strokeWidth="2" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
        </div>
    )
};