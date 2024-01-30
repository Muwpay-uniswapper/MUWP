import { Route, Token } from "@/lib/li.fi-ts";
import { Edge, Node, Position } from "reactflow";
import { TokenNodeData } from "./TokenNode";
import { graphlib, layout } from "dagre";
import { DetailNodeData } from "./DetailNode";

export function hash(token?: Token) {
    if (!token) {
        return "";
    }
    return `${token.symbol}-${token.address}-${token.chainId}`
}

const nodeWidth = 250;
const nodeHeight = 150;

const getLayoutedElements = (_nodes: { [key: string]: Node<TokenNodeData | DetailNodeData> }, edges: Edge[], options: { direction: string }) => {
    const dagreGraph = new graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = options.direction === 'LR';
    dagreGraph.setGraph({ rankdir: options.direction });

    const nodes = Object.values(_nodes);

    nodes.forEach((node) => {
        if (node.type === "detail") return;
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    layout(dagreGraph);

    nodes.forEach((node) => {
        if (node.type === "detail") return;
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
}

export function renderNodes(initialPoint: { x: number, y: number }, routes: Route[]): { nodes: Node<TokenNodeData | DetailNodeData>[], edges: Edge[] } {
    // Check if routes have different output tokens
    const outputTokens = routes.map((route) => route.steps[route.steps.length - 1].action.toToken);
    const outputTokenSet = new Set(outputTokens.map((token) => hash(token)));
    const hasMultipleOutputs = outputTokenSet.size > 1;

    if (routes.length === 0) {
        return { nodes: [], edges: [] };
    }

    const nodes: { [key: string]: Node<TokenNodeData | DetailNodeData> } = {};
    const edges: Edge[] = [];
    let point = { ...initialPoint };

    for (const route of routes) {
        let previousNodeId: string | null = null;

        for (let i = 0; i < route.steps.length; i++) {
            const step = route.steps[i];
            const fromNodeId = hash(step.action.fromToken);
            const toNodeId = step.action.toToken ? hash(step.action.toToken) : null;

            // Add or update the source node
            if (!nodes[fromNodeId]) {
                nodes[fromNodeId] = {
                    position: { ...point },
                    id: fromNodeId,
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    type: "token",
                    data: {
                        ...step.action.fromToken,
                        isInput: !hasMultipleOutputs && i === 0,
                        amounts: {}
                    },
                };
            }

            // Use the previous node's ID as the key for the amount, or the node's own ID if it's the first one
            if (!previousNodeId) {
                const _amount = (nodes[fromNodeId] as Node<TokenNodeData>).data.amounts[fromNodeId] ?? "0";
                const amount = _amount === "?" ? "?" : BigInt(_amount) + BigInt(step.action.fromAmount);
                (nodes[fromNodeId] as Node<TokenNodeData>).data.amounts[fromNodeId] = amount.toString();
            }

            // Add or update the target node
            if (toNodeId) {
                if (!nodes[toNodeId]) {
                    nodes[toNodeId] = {
                        position: { x: point.x, y: point.y + 250 },
                        id: toNodeId,
                        sourcePosition: Position.Right,
                        targetPosition: Position.Left,
                        type: "token",
                        data: {
                            ...step.action.toToken,
                            isInput: hasMultipleOutputs && i === route.steps.length - 1,
                            amounts: {}
                        },
                    };
                }

                // Update the target node's amounts with the amount from the current source node
                (nodes[toNodeId] as Node<TokenNodeData>).data.amounts[fromNodeId] = step.estimate?.toAmount || "?";

                // Add an edge from the source to the target
                const edgeId = `${fromNodeId}-${toNodeId}`;
                edges.push({
                    id: edgeId,
                    source: fromNodeId,
                    target: toNodeId,
                    data: {
                        label: step.tool,
                        toolDetails: step.toolDetails
                    },
                });

                previousNodeId = toNodeId;


                // Detail node
                const detailNodeId = `${edgeId}-detail`;
                nodes[detailNodeId] = {
                    position: { x: point.x + 100, y: point.y },
                    width: 400,
                    id: detailNodeId,
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    type: "detail",
                    data: { ...step, edgeId, },
                    style: {
                        opacity: 0,
                        pointerEvents: "none",
                    }
                };
            } else {
                previousNodeId = fromNodeId;
            }

            point.y += 250; // Increasing Y offset for each step
        }

        point.x += 250; // Increasing X offset for each route
        point.y = initialPoint.y; // Reset Y position for the next route
    }

    return getLayoutedElements(nodes, edges, { direction: "TB" });
}


