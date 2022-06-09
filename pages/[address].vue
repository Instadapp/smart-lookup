<script setup lang="ts">
import { networkScanBaseUrl } from "~~/core";
import QrcodeVue from "qrcode.vue";
import {
  CheckIcon,
  XIcon,
  ExclamationIcon,
  RefreshIcon,
} from "@heroicons/vue/solid";

const route = useRoute();

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

const { address, ens, detectedNetworks, taskResults, error, shortAddress } =
  useLookup(String(route.params.address));
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
              <div class="font-bold">{{ shortAddress }}</div>
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
                          'h-7 w-7 rounded-full flex items-center justify-center ring-8 ring-white',
                        ]"
                      >
                        <RefreshIcon
                          class="h-4 w-4 text-white animate-spin"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div v-else>
                      <span
                        :class="[
                          statusIconBackground[task.status],
                          'h-7 w-7 rounded-full flex items-center justify-center ring-8 ring-white',
                        ]"
                      >
                        <component
                          :is="statusIcon[task.status]"
                          class="h-4 w-4 text-white"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1">
                      <div>
                        <p class="text-sm text-gray-500">
                          {{ task.description }}
                        </p>
                      </div>
                      <div
                        class="ml-2 sm:ml-4 text-sm whitespace-nowrap text-gray-500 space-y-2"
                      >
                        <template
                          v-for="(result, network) in task.networkResults"
                        >
                          <div v-if="result.metadata" class="mt-1">
                            <div class="capitalize text-bold">
                              {{ network }}
                            </div>
                            <div class="ml-4 sm:ml-6">
                              <component
                                v-if="task.renderMetadata"
                                :is="
                                  task.renderMetadata({
                                    network,
                                    metadata: result.metadata,
                                  })
                                "
                              />
                              <ul v-else class="space-y-2 list-disc">
                                <li v-for="(value, key) in result.metadata">
                                  <span class="font-semibold capitalize">{{
                                    key
                                  }}</span
                                  >:

                                  <component
                                    v-if="task.renderMetadataValue"
                                    :is="
                                      task.renderMetadataValue({
                                        network,
                                        key,
                                        value,
                                      })
                                    "
                                  />
                                  <div
                                    class="ml-8 sm:ml-10"
                                    v-else-if="Array.isArray(value)"
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
