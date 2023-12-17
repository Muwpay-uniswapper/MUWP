import api from '@/lib/front/data/api';
import { BridgesList } from './bridges';
import { ExchangesList } from './exchanges';

export async function Networks() {
    const data = await api.toolsGet()
    return <div className="flex flex-row gap-4">
        <BridgesList bridges={data.bridges ?? []} />
        <ExchangesList data={data.exchanges ?? []} />
    </div>
}