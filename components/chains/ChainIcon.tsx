import { StellarChainId } from "@/lib/layerzero/aptos/omnichains";
import { ChainIcon } from "connectkit";
import Image from "next/image";

export default function ChainIcons({ id }: { id: number }) {
  if (id === StellarChainId) {
    return <Image src="/icons/stellar.svg" width={20} height={20} />;
  }
  return <ChainIcon id={id} />;
}
