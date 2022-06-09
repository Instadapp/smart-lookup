import { ethers } from "ethers";
import { networkProviderMap, networks, Task, TaskCheckResponse, tasks } from "~~/core";

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