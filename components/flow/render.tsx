import { Route, Token } from "@/lib/li.fi-ts";
import { Edge, Node, Position } from "reactflow";
import { TokenNodeData } from "./TokenNode";


export function renderNodes(initialPoint: { x: number, y: number }, routes: Route[]): { nodes: Node<TokenNodeData>[], edges: Edge[] } {
    function hash(token?: Token) {
        if (!token) {
            return "";
        }
        return `${token.symbol}-${token.address}-${token.chainId}`
    }
    if (routes.length === 0) {
        return { nodes: [], edges: [] };
    }
    const nodes = [];
    const edges = [];
    let maxSteps = 0;
    let point = { ...initialPoint };
    let maxY = 0;

    for (const route of routes) {
        if (route.steps.length > maxSteps) {
            maxSteps = route.steps.length; // Keep track of the longest route
        }

        for (let i = 0; i < route.steps.length; i++) {
            const step = route.steps[i];
            const node: Node<TokenNodeData> = {
                position: { ...point },
                id: hash(step.action.fromToken),
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
                type: "token",
                data: { ...step.action.fromToken, amount: step.action.fromAmount, isInput: i === 0 }
            };

            nodes.push(node);

            if (step.action.toToken) {
                const edge: Edge = {
                    id: `${hash(step.action.fromToken)}-${hash(step.action.toToken)}`,
                    source: hash(step.action.fromToken),
                    target: hash(step.action.toToken),
                    data: {
                        label: step.tool,
                    },
                };

                edges.push(edge);
            }

            point = {
                x: point.x,
                y: point.y + 250,
            };
        }

        point.x += 250; // Increasing X offset for each route
        if (point.y > maxY) {
            maxY = point.y;
        }
        point.y = initialPoint.y; // Reset X position for each route
    }

    // Add the final node
    const node: Node<TokenNodeData> = {
        position: {
            x: (point.x - initialPoint.x - 250) / 2,
            y: initialPoint.x + maxY + 250,
        },
        id: hash(routes[0].steps[routes[0].steps.length - 1].action.toToken),
        targetPosition: Position.Left,
        type: "token",
        data: { ...routes[0].steps[routes[0].steps.length - 1].action.toToken, amount: routes[0].steps[routes[0].steps.length - 1].estimate?.toAmount || "?" }
    };
    nodes.push(node);

    return { nodes, edges };
}
