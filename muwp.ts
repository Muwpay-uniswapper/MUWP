import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    bsc,
    zkSync,
    polygonZkEvm,
    base,
    avalanche,
    linea,
    gnosis,
    fantom,
    moonriver,
    moonbeam,
    fuse,
    okc,
    boba,
    aurora,
    goerli,
    Chain
} from 'viem/chains';

export interface MUWPChain extends Chain {
    muwpContract: `0x${string}`;
}

export const muwpChains = [
    { ...mainnet, muwpContract: "0x5145c72cdc6d840b5544b06e98603b180592d30c" },
    { ...arbitrum, muwpContract: "0x15A81218dC8119f2139e4fd413Cf4d0fF9FBd681" },
    { ...optimism, muwpContract: "0x15A81218dC8119f2139e4fd413Cf4d0fF9FBd681" },
    { ...polygon, muwpContract: "0x15A81218dC8119f2139e4fd413Cf4d0fF9FBd681" },
    { ...bsc, muwpContract: "0x15A81218dC8119f2139e4fd413Cf4d0fF9FBd681" },
    { ...zkSync, muwpContract: "0x" },
    { ...polygonZkEvm, muwpContract: "0x" },
    { ...base, muwpContract: "0x15A81218dC8119f2139e4fd413Cf4d0fF9FBd681" },
    { ...avalanche, muwpContract: "0x15A81218dC8119f2139e4fd413Cf4d0fF9FBd681" },
    { ...linea, muwpContract: "0x" },
    { ...gnosis, muwpContract: "0x" },
    { ...fantom, muwpContract: "0x" }, // Can't deploy on Fantom
    { ...moonriver, muwpContract: "0x" },
    { ...moonbeam, muwpContract: "0x" },
    { ...fuse, muwpContract: "0x" },
    { ...okc, muwpContract: "0x" },
    { ...boba, muwpContract: "0x" },
    { ...aurora, muwpContract: "0x" },
    ...(process.env.NODE_ENV !== 'production' ? [
        { ...goerli, muwpContract: "0x52249522A8b9D97E1DEcB257319EB94151e91618" as `0x${string}` },
    ] : []),
] as const;