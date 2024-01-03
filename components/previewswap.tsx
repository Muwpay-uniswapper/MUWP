"use client";

import { useRouteStore } from "@/lib/front/data/routeStore";
import { Card, CardContent } from "./ui/card";
import React, { useMemo } from "react";
import { Clock, DollarSign, Fuel, Layers2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Route } from "@/lib/li.fi-ts";
import { Badge } from "./ui/badge";

function calcStats(routes: Route[]) {
    const gasFees = routes.map((route) => Number(route.gasCostUSD)).reduce((a, b) => a + b, 0);
    const feeCosts = routes.map((route) => route.steps.map((step) => step.estimate?.feeCosts?.map((fee) => Number(fee.amountUSD))?.reduce((a, b) => a + b, 0) ?? 0).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
    let duration = routes.map((route) => route.steps.map((step) => step.estimate?.executionDuration ?? 0).reduce((a, b) => a + b, 0)).reduce((a, b) => Math.max(a, b), 0); // Steps are executed in parallel, so we take the max
    if (duration > 0) {
        duration += 3 * 60; // Add 3 min for the transaction to be mined
    }
    const steps = routes.map((route) => route.steps.length).reduce((a, b) => a + b, 0);

    return { gasFees, feeCosts, duration, steps }
}

export default function PreviewSwap() {
    const { getRoutes, routes: _routes } = useRouteStore();

    const routes = getRoutes();
    const optimal = Object.values(_routes).map((routes) => {
        return routes.find(route => route.tags?.includes("RECOMMENDED")) ?? routes[0]
    })
    const { gasFees, feeCosts, duration, steps } = calcStats(routes);
    const { gasFees: optimalGasFees, feeCosts: optimalFeeCosts, duration: optimalDuration, steps: optimalSteps } = calcStats(optimal);

    return <Card className="w-full mt-4">
        <CardContent className="flex flex-row justify-between items-center pt-6">
            <Tooltip>
                <TooltipTrigger>
                    <Fuel className="inline w-6 h-6 mr-1" /> {gasFees.toFixed(2)}$
                    {gasFees != optimalGasFees && <Badge className="ml-1" variant={gasFees > optimalGasFees ? "destructive" : "default"}>{gasFees > optimalGasFees ? "+" : ""}{((gasFees / optimalGasFees - 1) * 100).toFixed(2)}%</Badge>}
                </TooltipTrigger>
                <TooltipContent>
                    Total gas fees for all routes
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger>
                    <DollarSign className="inline w-6 h-6 mr-1" /> {feeCosts.toFixed(2)}$
                    {feeCosts != optimalFeeCosts && <Badge className="ml-1" variant={feeCosts > optimalFeeCosts ? "destructive" : "default"}>{feeCosts > optimalFeeCosts ? "+" : ""}{((feeCosts / optimalFeeCosts - 1) * 100).toFixed(2)}%</Badge>}
                </TooltipTrigger>
                <TooltipContent>
                    Total fees for all routes
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger>
                    <Clock className="inline w-6 h-6 mr-1" /> {Math.ceil(duration / 60)} min
                    {duration != optimalDuration && <Badge className="ml-1" variant={duration > optimalDuration ? "destructive" : "default"}>{duration > optimalDuration ? "+" : ""}{((duration / optimalDuration - 1) * 100).toFixed(2)}%</Badge>}
                </TooltipTrigger>
                <TooltipContent>
                    Total execution time for all routes. Some steps are executed in parallel.
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger><Layers2 className="inline w-6 h-6 mr-1" /> {steps}</TooltipTrigger>
                <TooltipContent>
                    Total number of steps for all routes
                </TooltipContent>
            </Tooltip>
        </CardContent>
    </Card>
}