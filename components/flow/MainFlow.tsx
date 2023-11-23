"use client";

import ReactFlow from "reactflow";
import { Card } from "../ui/card";

import "reactflow/dist/style.css"

export function MainFlow() {

    const initialNodes = [
        { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
        { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
    ];
    const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];


    return <Card className="w-full h-full">
        <ReactFlow nodes={initialNodes} edges={initialEdges} proOptions={{ hideAttribution: true }} />
    </Card>
}