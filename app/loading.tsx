import { Skeleton } from "@/components/ui/skeleton"

export default function Loader() {
    return <Skeleton className="w-full h-auto rounded-xl" style={{
        background: "var(--rk-colors-connectButtonBackground)"
    }} />
}