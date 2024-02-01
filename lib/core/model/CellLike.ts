export interface CellLike {
    value: string,
    label: string,
    logoURI?: string
}

export interface Token extends CellLike {
    address: string,
    ticker: string,
    decimals: number,
    priceUSD?: string,
    chainId: number,
    color?: string,
    verified: boolean
};

export interface Chain extends CellLike {
    chainId: number
    type: "EVM" | "SVM" | "Aptos"
}