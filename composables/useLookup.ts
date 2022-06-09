import { ethers } from "ethers";
import { VNode } from "vue";

const networks = {
    mainnet: "https://rpc.ankr.com/eth",
    polygon: "https://rpc.ankr.com/polygon",
    avalanche: "https://rpc.ankr.com/avalanche",
    fantom: "https://rpc.ankr.com/fantom",
    optimism: "https://rpc.ankr.com/optimism",
    arbitrum: "https://rpc.ankr.com/arbitrum",
};

const gnosisSafeAbi = [
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



const networkProviderMap = Object.keys(networks).reduce((acc, curr) => {
    acc[curr] = new ethers.providers.JsonRpcProvider(networks[curr]);
    return acc;
}, {});

type TaskCheckResponse = {
    status: "success" | "error" | "warning";
    metadata?: object;
};

type TaskCheckFun = ({
    address: string,
    provider: any,
}) => PromiseLike<TaskCheckResponse>;

type Task = {
    description: string;
    networkResults?: {
        [network: string]: TaskCheckResponse;
    };
    renderMetadata?: ({ network: string, metadata: object }) => VNode;
    renderMetadataValue?: ({ key: string, value: any }) => VNode;
    statusStrategy?: "some" | "every";
    check: TaskCheckFun;
};

const tasks: Array<Task> = [
    {
        description: "This is an EOA",

        async check({ address, provider }) {
            const code = await provider.getCode(address);

            if (code != "0x") {
                return { status: "error" };
            }

            return { status: "success" };
        },
    },

    {
        description: "This is a smart contract address",

        statusStrategy: "some",

        async check({ address, provider }) {
            const code = await provider.getCode(address);

            if (code === "0x") {
                return { status: "error" };
            }

            return { status: "success" };
        },
    },

    {
        description: "This is a gnosis safe address",

        statusStrategy: "some",

        async check({ address, provider }) {
            const contract = new ethers.Contract(address, gnosisSafeAbi, provider);

            try {
                const [owners, threshold] = await Promise.all([
                    contract.getOwners(),
                    contract.getThreshold(),
                ]);
                return {
                    status: "success",
                    metadata: { owners, threshold: threshold.toString() },
                };
            } catch (error) {
                return { status: "error" };
            }
        },
    },

    {
        description: "This address has transactions",

        statusStrategy: "some",

        async check({ address, provider }) {
            const count = await provider.getTransactionCount(address);

            if (count === 0) {
                return { status: "error" };
            }

            return { status: "success", metadata: { count } };
        },
    },
];

export function useLookup(addressOrEnsName: string) {

    const taskResults = ref<Array<{ loading: boolean, description: string, networkResults: Task['networkResults'], renderMetadata: Task['renderMetadata'], renderMetadataValue: Task['renderMetadataValue'], status: TaskCheckResponse['status'] }>>([]);
    const error = ref("");
    const mainnetProvider = new ethers.providers.JsonRpcProvider(networks.mainnet);

    const address = ref(ethers.utils.isAddress(addressOrEnsName) ? addressOrEnsName : "");
    const shortAddress = computed(() => address.value ? address.value.substr(0, 8) + "..." + address.value.substr(-6) : "");

    const ens = ref("");
    const detectedNetworks = computed(() => [
        ...new Set(
            taskResults.value.flatMap(({ networkResults }) => {
                if (networkResults) {
                    return Object.keys(networkResults).filter(
                        (network) => !!networkResults[network].metadata
                    );
                }

                return [];
            })
        ),
    ]);

    onMounted(async () => {
        if (!address.value) {
            try {
                address.value = await mainnetProvider.resolveName(addressOrEnsName);
                ens.value = addressOrEnsName;
            } catch (error) { }
        }

        if (!address.value) {
            error.value = "Invalid address or ENS name";
            return;
        }

        if (address.value && !ens.value) {
            mainnetProvider
                .lookupAddress(address.value)
                .then(async (result) => {
                    ens.value = result;
                })
                .catch((err) => { });
        }

        for (let index = 0; index < tasks.length; index++) {
            const task = tasks[index];

            taskResults.value.push({
                description: task.description,
                networkResults: {
                    mainnet: {
                        status: "success",
                    },
                    polygon: {
                        status: "success",
                    },
                    avalanche: {
                        status: "success",
                    },
                    fantom: {
                        status: "success",
                    },
                    optimism: {
                        status: "success",
                    },
                    arbitrum: {
                        status: "success",
                    },
                },
                status: "success",
                renderMetadata: task.renderMetadata,
                renderMetadataValue: task.renderMetadataValue,
                loading: true,
            });

            await Promise.allSettled(
                Object.keys(networks).map(async (network) => {
                    const result = await task.check({
                        address: address.value,
                        provider: networkProviderMap[network],
                    });

                    taskResults.value[index].networkResults[network] = result;
                })
            );

            taskResults.value[index].status = Object.values(
                taskResults.value[index].networkResults
            )[task.statusStrategy || "every"](({ status }) => status === "success")
                ? "success"
                : "error";
            taskResults.value[index].loading = false;
        }
    });
    return {
        address, ens, detectedNetworks, taskResults, error, shortAddress
    }
}