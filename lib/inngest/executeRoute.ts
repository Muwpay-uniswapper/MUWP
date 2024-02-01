import { inngest } from "./client";
import { z } from "zod";
import { Route } from "../li.fi-ts";
import { EthereumAddress } from "../core/model/Address";

const Data = z.object({
    address: EthereumAddress,
    route: Route.zod,
});

export const executeRoute = inngest.createFunction(
    { id: "execute-route" },
    { event: "app/execute.route" },
    async ({ event, step }) => {
        const data = await Data.parseAsync(event.data);

        await Promise.all(data.route.steps.map(async (_step) => {
            await step.sendEvent("app/consume.step", {
                name: "app/consume.step",
                data: {
                    step: _step,
                    address: data.address,
                }
            });

            await step.waitForEvent("wait-for-step-to-complete", {
                event: "app/step.completed",
                if: `async.data.id == ${_step.id}`,
                timeout: "15m",
            });
        }));
    }
);
