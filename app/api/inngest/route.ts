import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { initiateTransfer } from "@/lib/inngest/initiateTransfer";
import { executeRoute } from "@/lib/inngest/executeRoute";
import { terminateAccount } from "@/lib/inngest/terminateAccount";
import { consumeStep } from "@/lib/inngest/consumeStep";

// Can be 'nodejs', but Vercel recommends using 'edge'
export const runtime = 'edge';
// Prevents this route's response from being cached
export const dynamic = 'force-dynamic';

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        initiateTransfer,
        executeRoute,
        terminateAccount,
        consumeStep
    ],
    streaming: "allow",
});