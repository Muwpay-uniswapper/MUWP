import React from "react";
import { Position, getSimpleBezierPath } from "reactflow";

export const Funnel = ({ height = 4 }: { height: number }) => {
    const topBezier = getSimpleBezierPath({
        sourceX: 1,
        sourceY: 1,
        sourcePosition: Position.Right,
        targetX: 18,
        targetY: 5,
        targetPosition: Position.Left
    });

    const bottomBezier = getSimpleBezierPath({
        sourceX: 1,
        sourceY: 9,
        sourcePosition: Position.Right,
        targetX: 18,
        targetY: 5,
        targetPosition: Position.Left
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