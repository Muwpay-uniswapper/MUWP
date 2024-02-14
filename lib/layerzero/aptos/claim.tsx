import { Button } from "@/components/ui/button";
import { Aptos } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";



export function ClaimAptos() {
    const { account, signAndSubmitTransaction } = useWallet();
    async function claim(tokenAddress: string) {
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

    return <Button>
        Claim transferred tokens
    </Button>
}