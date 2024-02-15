import { WalletCombobox } from "@/components/chains/AddressSelector";
import { Button } from "@/components/ui/button";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";



export function ClaimAptos({
    tokensAddress
}: {
    tokensAddress: `0x${string}`[],
}) {
    const { account, signAndSubmitTransaction, network, connected } = useWallet();
    const [tokens, setTokens] = useState<string[]>([]);

    const tokensToClaim = tokensAddress.filter((token) => !tokens.includes(token));

    async function claim() {
        for (const tokenAddress of tokensToClaim) {
            const bridgeAddress = tokenAddress.split(":")[0];
            const signedTransaction = await signAndSubmitTransaction({
                sender: account?.address || "",
                data: {
                    function: `${bridgeAddress}::coin_bridge::claim_coin`,
                    typeArguments: [tokenAddress],
                    functionArguments: [],
                }
            });
            console.log(signedTransaction);
        }
    }

    useEffect(() => {
        if (!account?.address) {
            setTokens([]);
            return;
        };
        (async () => {
            const config = new AptosConfig({ network: network?.name }); // default network is devnet
            const aptos = new Aptos(config);
            const aptosBalance = await aptos.getAccountCoinsData({ accountAddress: account.address });
            const tokens = aptosBalance.map((coin) => coin.asset_type);
            setTokens(tokens);
        })()
    }, [account?.address])


    if (tokensToClaim.length === 0) {
        return null;
    }

    if (!connected) {
        return <WalletCombobox message="Connect to claim" />
    }

    return <Button onClick={claim}>
        Claim {tokensToClaim.length} transferred tokens
    </Button>
}