"use client";

import { useRouteStore } from "@/lib/front/data/routeStore";
import { Card, CardContent } from "./ui/card";
import React from "react";
import { Clock, DollarSign, Fuel, Layers2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function PreviewSwap() {
    const { getRoutes } = useRouteStore();

    const routes = getRoutes();
    const gasFees = routes.map((route) => Number(route.gasCostUSD)).reduce((a, b) => a + b, 0);
    const feeCosts = routes.map((route) => route.steps.map((step) => step.estimate?.feeCosts?.map((fee) => Number(fee.amountUSD))?.reduce((a, b) => a + b, 0) ?? 0).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
    const duration = routes.map((route) => route.steps.map((step) => step.estimate?.executionDuration ?? 0).reduce((a, b) => a + b, 0)).reduce((a, b) => Math.max(a, b), 0); // Steps are executed in parallel, so we take the max
    const steps = routes.map((route) => route.steps.length).reduce((a, b) => a + b, 0);

    return <Card className="w-full mt-4">
        <CardContent className="flex flex-row justify-between items-center pt-6">
            <Tooltip>
                <TooltipTrigger><Fuel className="inline w-6 h-6 mr-1" /> {gasFees.toFixed(2)}$</TooltipTrigger>
                <TooltipContent>
                    Total gas fees for all routes
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger><DollarSign className="inline w-6 h-6 mr-1" /> {feeCosts.toFixed(2)}$</TooltipTrigger>
                <TooltipContent>
                    Total fees for all routes
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger><Clock className="inline w-6 h-6 mr-1" /> {Math.ceil(duration / 60)} min</TooltipTrigger>
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