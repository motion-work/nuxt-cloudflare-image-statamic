export default defineNuxtConfig({
  modules: ['../src/module'],
  compatibilityDate: '2026-11-03',
  runtimeConfig: {
    public: {
      imageTransformHost: 'https://homie.io',
      cmsAssetOrigin: 'https://homie-nwevzsmftweb.s3.gra.io.cloud.ovh.net',
    },
  },
})
