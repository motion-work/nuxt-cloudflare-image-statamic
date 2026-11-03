import type { CloudflareImageConfig } from './types'

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    imageTransformHost?: string
    cmsAssetOrigin?: string
    cloudflareImage?: CloudflareImageConfig
  }
}

export {}
