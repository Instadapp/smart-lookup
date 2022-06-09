<template>
  <Html class="h-full bg-gray-50">
    <Body class="h-full" />
  </Html>
  <div
    class="min-h-full flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8"
  >
    <NuxtLink to="/" class="mt-5 text-center text-3xl font-extrabold text-gray-900">
      Smart Lookup
    </NuxtLink>

    <div class="w-full mt-5">
      <NuxtPage />
    </div>

    <div class="mt-5">
      Made with ❤️ by
      <a
        href="https://instadapp.io"
        class="hover:underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
        >Instadapp</a
      >
    </div>
  </div>
</template>
