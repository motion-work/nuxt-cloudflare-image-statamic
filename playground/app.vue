<template>
  <main style="padding: 2rem; font-family: system-ui, sans-serif;">
    <h1>nuxt-cloudflare-image-statamic playground</h1>
    <AppImage
      :src="sample"
      width="400"
      sizes="400px"
    />
  </main>
</template>

<script setup lang="ts">
const sample = {
  permalink: 'https://homie-nwevzsmftweb.s3.gra.io.cloud.ovh.net/p/assets/team/tom-diggelmann.jpg',
  width: 1200,
  height: 800,
  alt: 'Sample',
  focus_css: '50% 30%',
}
</script>
