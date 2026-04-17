import { HashportChainId, StellarChainId } from "@/lib/layerzero/aptos/omnichains";
import { ChainIcon } from "connectkit";
import Image from "next/image";

export default function ChainIcons({ id }: { id: number }) {
  if (id === StellarChainId) {
    return (
      <Image src="/icons/stellar.svg" width={20} height={20} alt="Stellar" />
    );
  }
  if (id === HashportChainId) {
    return (
      <img
        src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/hedera/info/logo.png"
        width={20}
        height={20}
        alt="Hedera"
      />
    );
  }
  return <ChainIcon id={id} />;
}
