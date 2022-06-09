import { ethers } from "ethers";

export const networks = {
    mainnet: "https://rpc.ankr.com/eth",
    polygon: "https://rpc.ankr.com/polygon",
    avalanche: "https://rpc.ankr.com/avalanche",
    fantom: "https://rpc.ankr.com/fantom",
    optimism: "https://rpc.ankr.com/optimism",
    arbitrum: "https://rpc.ankr.com/arbitrum",
};


export const networkScanBaseUrl = {
    mainnet: "https://etherscan.io/",
    polygon: "https://polygonscan.com/",
    avalanche: "https://snowtrace.io/",
    fantom: "https://ftmscan.com/",
    optimism: "https://optimistic.etherscan.io/",
    arbitrum: "https://arbiscan.io/",
};

export type Network = keyof typeof networks;

export const gnosisSafeAbi = [
    {
        inputs: [],
        name: "getOwners",
        outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getThreshold",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
];



export const networkProviderMap = Object.keys(networks).reduce((acc, curr) => {
    acc[curr] = new ethers.providers.JsonRpcProvider(networks[curr]);
    return acc;
}, {});