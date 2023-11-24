"use client";

import ReactFlow, { Connection, DefaultEdgeOptions, Edge, ReactFlowProvider, addEdge, useEdgesState, useNodesState, useReactFlow, useViewport } from "reactflow";
import { Card } from "../ui/card";

import "reactflow/dist/style.css"
import { useRouteStore } from "@/lib/front/data/routeStore";
import { renderNodes } from "./render";
import EdgeExchange from "./EdgeExchange";
import TokenNode from "./TokenNode";
import React, { useCallback, useMemo } from "react";
import { GradientIdContext } from "./provider";
import { number } from "zod";

const edgeTypes = {
    exchange: EdgeExchange,
}

const nodeTypes = {
    token: TokenNode,
}

export function MainFlow() {
    return <ReactFlowProvider>
        <Flow />
    </ReactFlowProvider>
}

export function Flow() {
    const { routes } = useRouteStore();
    const gradientId = useMemo(() => 'gradient-' + Math.random(), []);

    const { setCenter, fitView } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [isFocused, setIsFocused] = React.useState(false);
    const [focusedPoint, setFocusedPoint] = React.useState<{ x1: number, y1: number, x2: number, y2: number }>({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });

    React.useEffect(() => {
        const renderedRoutes = renderNodes({
            x: 0,
            y: 0,
        }, routes);

        setNodes(renderedRoutes.nodes);
        setEdges(renderedRoutes.edges);

        setIsFocused(false);

        setTimeout(() => {
            fitView({ duration: 200, includeHiddenNodes: true })
        }, 50);

    }, [routes]);

    const focus = (event: React.MouseEvent, edge: Edge) => {
        if (!isFocused) {
            const sourceNode = nodes.find((node) => node.id === edge.source);
            const targetNode = nodes.find((node) => node.id === edge.target);
            setFocusedPoint({
                x1: sourceNode?.position.x || 0,
                y1: sourceNode?.position.y || 0,
                x2: targetNode?.position.x || 0,
                y2: targetNode?.position.y || 0,
            });

            setCenter(100, 150, { duration: 200, zoom: 1 });
        } else {
            setTimeout(() => {
                fitView({ duration: 200, includeHiddenNodes: true })
            }, 50);
        }

        const _isFocused = !isFocused;
        setNodes((nodes) => {
            // Hide all other nodes
            return nodes.map((node) => {
                if (node.id === edge.source) {
                    return {
                        ...node,
                        position: {
                            x: _isFocused ? 0 : focusedPoint.x1,
                            y: _isFocused ? 0 : focusedPoint.y1,
                        },
                    }
                } else if (node.id === edge.target) {
                    return {
                        ...node,
                        position: {
                            x: _isFocused ? 0 : focusedPoint.x2,
                            y: _isFocused ? 250 : focusedPoint.y2,
                        },
                    }
                }
                return {
                    ...node,
                    style: {
                        ...node.style,
                        opacity: _isFocused ? 0 : 1,
                    }
                };
            })
        })
        setEdges((edges) => {
            // Hide all other edges
            return edges.map((_edge) => {
                if (_edge.id !== edge.id) {
                    return {
                        ..._edge,
                        style: {
                            ..._edge.style,
                            opacity: _isFocused ? 0 : 1,
                        }
                    };
                }
                return _edge;
            })
        })

        setIsFocused(_isFocused);
    }

    const defaultEdgeOptions: DefaultEdgeOptions = {
        type: 'exchange',
        markerEnd: 'edge-circle'
    };

    const onConnect = useCallback((params: Edge | Connection) => setEdges((els) => addEdge(params, els)), [edges]);

    return <Card className="w-full h-full">
        <GradientIdContext.Provider value={gradientId}>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                proOptions={{ hideAttribution: true }}
                edgeTypes={edgeTypes}
                nodeTypes={nodeTypes}
                onConnect={onConnect}
                onEdgeClick={focus}
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
            </ReactFlow>
        </GradientIdContext.Provider>
    </Card>
}