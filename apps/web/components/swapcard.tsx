import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/core/utils";
import { ConnectButton } from "@/components/connectbutton";
import { ArrowDown, Wallet } from "lucide-react";
import { TokenSelector, ChainSelector } from "@/components/dataFetch";
import { Separator } from "./ui/separator";
import Loader from "../app/loading";
import { FindRoutesButton } from "./layout/FindRoutesButton";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Wallets } from "./preview/wallets";

export function SwapCard({
  chain,
  toChain,
}: {
  chain?: string;
  toChain?: string;
}) {
  return (
    <Card className={cn("md:w-4/12 relative mx-4")}>
      <ConnectButton
        not
        asChild
        className="absolute top-0 w-full h-full backdrop-blur-sm z-50 opacity-0 hover:opacity-100 transition-all rounded flex justify-center items-center"
      />
      <CardHeader>
        <CardTitle>Swap</CardTitle>
        <CardDescription>
          Choose 1 or more input tokens to swap to the destination token.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row gap-2">
          <Suspense fallback={<Loader />}>
            <ChainSelector mode="input" />
          </Suspense>
          <ConnectButton />
        </div>
        <Suspense fallback={<Loader />}>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-black mt-2" variant="secondary">
                <Wallet className="w-4 h-4 mr-1" /> Multi-Wallets
              </Button>
            </DialogTrigger>
            <DialogContent>
              <Wallets />
            </DialogContent>
          </Dialog>
        </Suspense>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-2 w-full mt-2">
          <Suspense fallback={<Loader />}>
            <TokenSelector
              id="from-token"
              chain={chain ? Number.parseInt(chain) : undefined}
              mode="input"
            />
          </Suspense>
        </div>
        <Separator className="mt-8">
          <ArrowDown className="text-white -translate-y-1/2 mx-2" />
        </Separator>
        <div className="grid grid-cols-1 gap-4 w-full mt-8 mb-4">
          <Suspense fallback={<Loader />}>
            <ChainSelector mode="output" />
          </Suspense>
          {toChain && (
            <Suspense fallback={<Loader />}>
              <TokenSelector
                id="to-token"
                chain={toChain ? Number.parseInt(toChain) : undefined}
                mode="output"
              />
            </Suspense>
          )}
        </div>
        <FindRoutesButton />
      </CardContent>
    </Card>
  );
}
