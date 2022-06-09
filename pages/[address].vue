<script setup lang="ts">
import QrcodeVue from "qrcode.vue";
import {
  CheckIcon,
  XIcon,
  ExclamationIcon,
  RefreshIcon,
} from "@heroicons/vue/solid";
import { ethers } from "ethers";

const networks = {
  mainnet: "https://rpc.ankr.com/eth",
  polygon: "https://rpc.ankr.com/polygon",
  avalanche: "https://rpc.ankr.com/avalanche",
  fantom: "https://rpc.ankr.com/fantom",
  optimism: "https://rpc.ankr.com/optimism",
  arbitrum: "https://rpc.ankr.com/arbitrum",
};

const networkScanBaseUrl = {
  mainnet: "https://etherscan.io/",
  polygon: "https://polygonscan.com/",
  avalanche: "https://snowtrace.io/",
  fantom: "https://ftmscan.com/",
  optimism: "https://optimistic.etherscan.io/",
  arbitrum: "https://arbiscan.io/",
};

const networkProviderMap = Object.keys(networks).reduce((acc, curr) => {
  acc[curr] = new ethers.providers.JsonRpcProvider(networks[curr]);
  return acc;
}, {});

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

const statusIconBackground = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-orange-500",
};

const statusIcon = {
  success: CheckIcon,
  error: XIcon,
  warning: ExclamationIcon,
};

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

const taskResults = ref([]);
const error = ref("");

const route = useRoute();
const addressParam = String(route.params.address);
const mainnetProvider = new ethers.providers.JsonRpcProvider(networks.mainnet);

const address = ref(ethers.utils.isAddress(addressParam) ? addressParam : "");
const shortenAddress = () => {
  return address.value.substr(0, 8) + "..." + address.value.substr(-6);
};
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
      address.value = await mainnetProvider.resolveName(addressParam);
      ens.value = addressParam;
    } catch (error) {}
  }

  if (!address.value) {
    error.value = "Invalid address or ENS name";
    return;
  }

  if (address.value) {
    mainnetProvider
      .lookupAddress(address.value)
      .then(async (result) => {
        ens.value = result;
      })
      .catch((err) => {});
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
</script>

<template>
  <div class="sm:mx-auto sm:w-full sm:max-w-xl">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div v-if="error" class="flex items-center justify-center py-10">
        <span class="font-semibold text-lg">{{ error }}</span>
      </div>

      <div v-else-if="address" class="flex flex-col items-center">
        <QrcodeVue
          :size="196"
          :value="address"
          class="rounded-lg p-2 border-2 border-gray-200"
          foreground="#052740"
        />

        <div class="mt-8">
          <div class="text-center">
            <div class="text-gray-600 text-sm">
              <div class="font-bold">{{ shortenAddress() }}</div>
              <div class="text-gray-500" v-if="ens">({{ ens }})</div>
            </div>
          </div>
        </div>

        <div class="mt-3 w-full px-20" v-if="detectedNetworks.length">
          <div class="text-center flex flex-wrap justify-center gap-2">
            <a
              v-for="network in detectedNetworks"
              class="capitalize bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm shadow-sm"
              :href="`${networkScanBaseUrl[network]}address/${address}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ network }}
            </a>
          </div>
        </div>

        <div class="mt-8 w-full px-4">
          <div class="flow-root">
            <ul role="list" class="-mb-5">
              <li v-for="(task, taskIdx) in taskResults" :key="taskIdx">
                <div class="relative pb-5">
                  <span
                    v-if="taskIdx !== taskResults.length - 1"
                    class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                  <div class="relative flex space-x-3">
                    <div v-if="task.loading">
                      <span
                        :class="[
                          'bg-gray-400',
                          'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                        ]"
                      >
                        <RefreshIcon
                          class="h-5 w-5 text-white animate-spin"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div v-else>
                      <span
                        :class="[
                          statusIconBackground[task.status],
                          'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                        ]"
                      >
                        <component
                          :is="statusIcon[task.status]"
                          class="h-5 w-5 text-white"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5">
                      <div>
                        <p class="text-sm text-gray-500">
                          {{ task.description }}

                          <span
                            v-if="task.network"
                            class="text-gray-500 text-sm"
                          >
                            ({{ task.network }})
                          </span>
                        </p>
                      </div>
                      <div
                        class="ml-4 text-sm whitespace-nowrap text-gray-500 space-y-2"
                      >
                        <template
                          v-for="(result, network) in task.networkResults"
                        >
                          <div v-if="result.metadata">
                            <div class="capitalize text-bold">
                              {{ network }}
                            </div>
                            <div class="ml-4">
                              <ul class="space-y-2 list-disc">
                                <li v-for="(value, key) in result.metadata">
                                  <span class="font-semibold capitalize">{{
                                    key
                                  }}</span
                                  >:

                                  <div
                                    class="ml-10"
                                    v-if="Array.isArray(value)"
                                  >
                                    <ul class="list-decimal">
                                      <li v-for="val in value">
                                        {{ val }}
                                      </li>
                                    </ul>
                                  </div>

                                  <span v-else class="text-xs">{{
                                    String(value)
                                  }}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div v-else class="flex items-center justify-center py-10">
        <RefreshIcon class="w-10 h-10 animate-spin text-gray-600" />
      </div>
    </div>
  </div>
</template>
