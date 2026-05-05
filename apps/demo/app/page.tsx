"use client";
import { useState } from "react";
import { SubscriptionForm } from "./components/SubscriptionForm";
import { QuoteForm } from "./components/QuoteForm";

const TABS = ["Soroban Subscription", "EVM → XLM Quote"] as const;
type Tab = (typeof TABS)[number];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Soroban Subscription");

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">@muwp/sdk demo</h1>
        <p className="text-gray-400 text-sm mt-1">
          Live demonstration on Stellar mainnet. Backend signing pattern — keys in{" "}
          <code className="text-indigo-400">.env</code>.
        </p>
      </header>

      <div className="flex border-b border-gray-800 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-indigo-500 text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Soroban Subscription" && <SubscriptionForm />}
      {activeTab === "EVM → XLM Quote" && <QuoteForm />}
    </main>
  );
}
