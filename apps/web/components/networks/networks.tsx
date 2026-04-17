import api from "@/lib/core/data/api";
import { BridgesList } from "./bridges";
import { ExchangesList } from "./exchanges";

export async function Networks() {
  const data = await api.toolsGet();
  return (
    <div className="flex flex-col lg:flex-row gap-4 max-w-[100vw]">
      <BridgesList bridges={data.bridges ?? []} />
      <ExchangesList data={data.exchanges ?? []} />
    </div>
  );
}
