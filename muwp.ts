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
    polygonMumbai,
    Chain
} from 'viem/chains';

export interface MUWPChain extends Chain {
    muwpContract: `0x${string}`;
}

export const muwpChains: MUWPChain[] = [
    { ...mainnet, muwpContract: "0x" },
    { ...arbitrum, muwpContract: "0x" },
    { ...optimism, muwpContract: "0x" },
    { ...polygon, muwpContract: "0x" },
    { ...bsc, muwpContract: "0x" },
    { ...zkSync, muwpContract: "0x" },
    { ...polygonZkEvm, muwpContract: "0x" },
    { ...base, muwpContract: "0x" },
    { ...avalanche, muwpContract: "0x" },
    { ...linea, muwpContract: "0x" },
    { ...gnosis, muwpContract: "0x" },
    { ...fantom, muwpContract: "0x" },
    { ...moonriver, muwpContract: "0x" },
    { ...moonbeam, muwpContract: "0x" },
    { ...fuse, muwpContract: "0x" },
    { ...okc, muwpContract: "0x" },
    { ...boba, muwpContract: "0x" },
    { ...aurora, muwpContract: "0x" },
    ...(process.env.NODE_ENV !== 'production' ? [
        { ...goerli, muwpContract: "0xADf1687e201d1DCb466D902F350499D008811e84" as `0x${string}` },
        { ...polygonMumbai, muwpContract: "0x" as `0x${string}` }
    ] : []),
]