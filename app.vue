<template>
  <Html class="h-full bg-gray-50">
    <title>Smart Address Lookup | Instadapp</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"
    />
    <meta name="title" content="Smart Address Lookup | Instadapp" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://smart-lookup.instadapp.io/" />
    <meta property="og:title" content="Smart Address Lookup | Instadapp" />
    <meta
      property="og:image"
      content="https://smart-lookup.instadapp.io/logo.png"
    />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary" />
    <meta property="twitter:url" content="https://smart-lookup.instadapp.io/" />
    <meta property="twitter:title" content="Smart Address Lookup | Instadapp" />
    <meta
      property="twitter:image"
      content="https://smart-lookup.instadapp.io/logo.png"
    />

    <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
    <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
    <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
    <link
      rel="apple-touch-icon"
      sizes="114x114"
      href="/apple-icon-114x114.png"
    />
    <link
      rel="apple-touch-icon"
      sizes="120x120"
      href="/apple-icon-120x120.png"
    />
    <link
      rel="apple-touch-icon"
      sizes="144x144"
      href="/apple-icon-144x144.png"
    />
    <link
      rel="apple-touch-icon"
      sizes="152x152"
      href="/apple-icon-152x152.png"
    />
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="/apple-icon-180x180.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="192x192"
      href="/android-icon-192x192.png"
    />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="msapplication-TileColor" content="#ffffff" />
    <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
    <meta name="theme-color" content="#ffffff" />
    <Body class="h-full" />
  </Html>
  <div
    class="min-h-full flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8"
  >
    <NuxtLink
      to="/"
      class="mt-5 text-center text-3xl font-extrabold text-gray-900"
    >
      Smart Address Lookup
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
