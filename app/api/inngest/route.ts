import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { executeRoute } from "@/lib/inngest/executeRoute";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        executeRoute
    ],
});