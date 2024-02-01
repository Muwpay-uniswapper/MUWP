"use client";

import ReactFlow, { Connection, DefaultEdgeOptions, Edge, Panel, ReactFlowProvider, addEdge, useEdgesState, useNodesState, useReactFlow, useViewport } from "reactflow";
import { Card } from "../ui/card";

import "reactflow/dist/style.css"
import { useRouteStore } from "@/lib/core/data/routeStore";
import { hash, renderNodes } from "./render";
import EdgeExchange from "./EdgeExchange";
import TokenNode from "./TokenNode";
import React, { useCallback, useMemo } from "react";
import { GradientIdContext } from "./provider";
import DetailNode from "./DetailNode";
import { Route, Step } from "@/lib/li.fi-ts";
import { Progress } from "./progress";

const edgeTypes = {
    exchange: EdgeExchange,
}

const nodeTypes = {
    token: TokenNode,
    detail: DetailNode,
}

export function MainFlow() {
    return <ReactFlowProvider>
        <Flow />
    </ReactFlowProvider>
}

export function Flow() {
    const { routes, setFocused, getRoutes, chosenIndex, needsUpdate, validUntil } = useRouteStore();
    const gradientId = useMemo(() => 'gradient-' + Math.random(), []);

    const { setCenter, fitView } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    React.useEffect(() => {
        const renderedRoutes = renderNodes({
            x: 0,
            y: 0,
        }, getRoutes());

        setNodes(() => renderedRoutes.nodes);
        setEdges(() => renderedRoutes.edges);

        setTimeout(() => {
            fitView({ duration: 500, includeHiddenNodes: false })
        }, 50);

    }, [routes, chosenIndex, needsUpdate]);

    // Fit view on window resize
    React.useEffect(() => {
        const onResize = () => {
            fitView({ duration: 500, includeHiddenNodes: false })
        }
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const defaultEdgeOptions: DefaultEdgeOptions = {
        type: 'exchange',
        markerEnd: 'edge-circle'
    };

    const onConnect = useCallback((params: Edge | Connection) => setEdges((els) => addEdge(params, els)), [edges]);

    return <Card className="w-full h-[75vh]">
        <GradientIdContext.Provider value={gradientId}>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodesDraggable={false}
                nodesConnectable={false}
                proOptions={{ hideAttribution: true }}
                edgeTypes={edgeTypes}
                nodeTypes={nodeTypes}
                onConnect={onConnect}
                onEdgeClick={(event, edge) => setFocused(nodes, edge, setNodes, setEdges, setCenter, fitView)}
                defaultEdgeOptions={defaultEdgeOptions}
            >
                <svg>
                    <defs>
                        <linearGradient id={gradientId}>
                            <stop offset="0%" stopColor="#ae53ba" />
                            <stop offset="100%" stopColor="#2a8af6" />
                        </linearGradient>

                        <marker
                            id="edge-circle"
                            viewBox="-5 -5 10 10"
                            refX="0"
                            refY="0"
                            markerUnits="strokeWidth"
                            markerWidth="10"
                            markerHeight="10"
                            orient="auto"
                        >
                            <circle stroke="#2a8af6" strokeOpacity="0.75" r="2" cx="0" cy="0" />
                        </marker>
                    </defs>
                </svg>
                <Panel position="top-right">
                    {validUntil && nodes.length > 0 && <Progress validUntil={validUntil} />}
                </Panel>

                {nodes.length == 0 && <Panel position="top-center">
                    <span className="text-gray-500">Find a route to swap tokens</span>
                </Panel>}
            </ReactFlow>
        </GradientIdContext.Provider>
    </Card>
}