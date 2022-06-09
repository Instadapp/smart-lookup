<script setup lang="ts">
const router = useRouter();
const address = ref();

const lookup = () => {
  if (!address.value) {
    return;
  }

  router.push(`/${address.value}`);
};
</script>
<template>
  <div class="sm:mx-auto sm:w-full sm:max-w-xl">

    <div
      class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 flex items-center gap-4"
    >
      <input
        v-model="address"
        class="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Enter any address"
      />

      <button
        @click="lookup"
        type="submit"
        :disabled="!address"
        class="flex-shrink-0 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 disabled:bg-blue-400 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
        Lookup
      </button>
    </div>
  </div>
</template>
