import { Skeleton } from "@/components/ui/skeleton"

export default function Loader() {
    return <Skeleton className="w-full rounded-xl h-24 max-w-screen-xl" style={{
        background: "var(--rk-colors-connectButtonBackground)"
    }} />
}