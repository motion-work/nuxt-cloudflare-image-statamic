// Used only by `nuxt-module-build prepare` (via `pnpm dev:prepare`) to type-check
// and prepare the module against a minimal Nuxt instance at the package root.
// The module itself is developed/tested against `playground/`.
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      imageTransformHost: 'https://homie.io',
      cmsAssetOrigin: 'https://homie-nwevzsmftweb.s3.gra.io.cloud.ovh.net',
    },
  },
})
