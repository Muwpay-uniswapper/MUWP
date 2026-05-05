"use client";
import { useState } from "react";

type QuoteResult = {
  tempAccount: string;
  validUntil: string;
  routeCount: number;
  routes: Array<{ id: string; tags?: string[]; toAmountUSD?: string; steps: unknown[] }>;
} | { error: string } | null;

export function QuoteForm() {
  const [tokenAddress, setTokenAddress] = useState("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
  const [amount, setAmount] = useState("500000000");
  const [chainId, setChainId] = useState("1");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuoteResult>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputTokens: [{ address: tokenAddress, value: "token" }],
          inputAmount: { token: amount },
          inputChain: chainId,
          distribution: [100],
        }),
      });
      setResult(await res.json());
    } catch (err: unknown) {
      setResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-xs text-gray-400 mb-1 block">Token address (EVM)</span>
          <input
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          />
        </label>
        <label className="block">
          <span className="text-xs text-gray-400 mb-1 block">Amount (raw units)</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          />
        </label>
        <label className="block">
          <span className="text-xs text-gray-400 mb-1 block">Source chain ID</span>
          <select
            value={chainId}
            onChange={(e) => setChainId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="1">Ethereum (1)</option>
            <option value="137">Polygon (137)</option>
            <option value="56">BNB Chain (56)</option>
            <option value="42161">Arbitrum (42161)</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded text-sm"
        >
          {loading ? "Fetching routes…" : "Get Quote"}
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
