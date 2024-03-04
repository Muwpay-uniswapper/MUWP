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

export const muwpChains: MUWPChain[] = [
    { ...mainnet, muwpContract: "0x447cEeC7e6bBa8f357C145d64854D7708ec92cBd" },
    { ...arbitrum, muwpContract: "0x5367E923548194E663A2CF431bA2C0224a753499" },
    { ...optimism, muwpContract: "0xA298f3265CeDFFf333f0fa939C64a292dd948993" },
    { ...polygon, muwpContract: "0x98601B2f9f484FEfDB7f032D35cE09E075CE083f" },
    { ...bsc, muwpContract: "0xA298f3265CeDFFf333f0fa939C64a292dd948993" },
    { ...zkSync, muwpContract: "0x" },
    { ...polygonZkEvm, muwpContract: "0x" },
    { ...base, muwpContract: "0x52249522A8b9D97E1DEcB257319EB94151e91618" },
    { ...avalanche, muwpContract: "0x795995c3Df5f6Ba7Adab37F34B09B4178b19FF60" },
    { ...linea, muwpContract: "0x" },
    { ...gnosis, muwpContract: "0x" },
    { ...fantom, muwpContract: "0x7031700988931E274B92a084066CbF8f4c62b23b" },
    { ...moonriver, muwpContract: "0x" },
    { ...moonbeam, muwpContract: "0x" },
    { ...fuse, muwpContract: "0x" },
    { ...okc, muwpContract: "0x" },
    { ...boba, muwpContract: "0x" },
    { ...aurora, muwpContract: "0x" },
    ...(process.env.NODE_ENV !== 'production' ? [
        { ...goerli, muwpContract: "0x52249522A8b9D97E1DEcB257319EB94151e91618" as `0x${string}` },
    ] : []),
]