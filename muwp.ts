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
    { ...arbitrum, muwpContract: "0x7031700988931E274B92a084066CbF8f4c62b23b" },
    { ...optimism, muwpContract: "0x7031700988931E274B92a084066CbF8f4c62b23b" },
    { ...polygon, muwpContract: "0x7031700988931E274B92a084066CbF8f4c62b23b" },
    { ...bsc, muwpContract: "0x7031700988931E274B92a084066CbF8f4c62b23b" },
    { ...zkSync, muwpContract: "0x" },
    { ...polygonZkEvm, muwpContract: "0x" },
    { ...base, muwpContract: "0x7031700988931E274B92a084066CbF8f4c62b23b" },
    { ...avalanche, muwpContract: "0x7031700988931E274B92a084066CbF8f4c62b23b" },
    { ...linea, muwpContract: "0x" },
    { ...gnosis, muwpContract: "0x" },
    { ...fantom, muwpContract: "0x" },
    { ...moonriver, muwpContract: "0x" },
    { ...moonbeam, muwpContract: "0x" },
    { ...fuse, muwpContract: "0x" },
    { ...okc, muwpContract: "0x" },
    { ...boba, muwpContract: "0x" },
    { ...aurora, muwpContract: "0x" },
    { ...goerli, muwpContract: "0xADf1687e201d1DCb466D902F350499D008811e84" },
    ...(process.env.NODE_ENV !== 'production' ? [
        { ...polygonMumbai, muwpContract: "0x" as `0x${string}` }
    ] : []),
]