import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Button } from '../ui/button';
export function NextWallet() {
    const { disconnect } = useDisconnect();
    const { openConnectModal } = useConnectModal();

    function nextWallet() {
        disconnect();
        openConnectModal?.();
    }

    return <Button onClick={nextWallet}>Next Wallet</Button>
}