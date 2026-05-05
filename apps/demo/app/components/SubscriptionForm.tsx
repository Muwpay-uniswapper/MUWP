"use client";
import { useState } from "react";

type Action = "create" | "approve" | "get" | "trigger" | "cancel";
type ApiResult = Record<string, unknown> | null;

const ACTIONS: { id: Action; label: string }[] = [
  { id: "create", label: "Create" },
  { id: "approve", label: "Approve" },
  { id: "get", label: "Get" },
  { id: "trigger", label: "Trigger" },
  { id: "cancel", label: "Cancel" },
];

const ACTION_DESCRIPTIONS: Record<Action, string> = {
  create: "Signs with STELLAR_SECRET as subscriber.",
  approve: "Grants the contract an allowance to spend tokens on behalf of the subscriber.",
  get: "Read-only — no signature required.",
  trigger: "Permissionless — any account can trigger a due payment.",
  cancel: "Signs with STELLAR_SECRET (subscriber key).",
};

const ACTION_LABELS: Record<Action, string> = {
  create: "Create Subscription",
  approve: "Approve Allowance",
  get: "Get Subscription",
  trigger: "Trigger Payment",
  cancel: "Cancel Subscription",
};

export function SubscriptionForm() {
  const [action, setAction] = useState<Action>("create");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [token, setToken] = useState("CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("10000000");
  const [intervalSeconds, setIntervalSeconds] = useState("3600");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult>(null);

  async function call(path: string, body: Record<string, unknown>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
      if (data.subscriptionId !== undefined) {
        setSubscriptionId(String(data.subscriptionId));
      }
    } catch (err: unknown) {
      setResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const routes: Record<Action, () => void> = {
      create:  () => call("/api/subscription", { token, recipient, amount, intervalSeconds }),
      approve: () => call("/api/subscription/approve", { token, amount }),
      get:     () => call("/api/subscription/get", { subscriptionId }),
      trigger: () => call("/api/subscription/trigger", { subscriptionId }),
      cancel:  () => call("/api/subscription/cancel", { subscriptionId }),
    };
    routes[action]();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-900 p-1 rounded">
        {ACTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setAction(id); setResult(null); }}
            className={`flex-1 py-1.5 text-xs rounded transition-colors ${
              action === id
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {action !== "create" && action !== "approve" && (
          <Field label="Subscription ID" value={subscriptionId} onChange={setSubscriptionId} required />
        )}
        {action === "create" && (
          <>
            <Field label="Token (SAC address)" value={token} onChange={setToken} />
            <Field label="Recipient (G...)" value={recipient} onChange={setRecipient} required />
            <Field label="Amount (stroops)" value={amount} onChange={setAmount} />
            <Field label="Interval (seconds)" value={intervalSeconds} onChange={setIntervalSeconds} />
          </>
        )}
        {action === "approve" && (
          <>
            <Field label="Token (SAC address)" value={token} onChange={setToken} />
            <Field label="Allowance (stroops)" value={amount} onChange={setAmount} />
          </>
        )}
        <p className="text-xs text-gray-500">{ACTION_DESCRIPTIONS[action]}</p>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded text-sm"
        >
          {loading ? "Processing…" : ACTION_LABELS[action]}
        </button>
      </form>

      {result && (
        <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto text-green-400">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, required,
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-400 mb-1 block">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
      />
    </label>
  );
}
