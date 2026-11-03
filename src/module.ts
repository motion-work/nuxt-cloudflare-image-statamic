import type { CloudflareImageConfig } from './runtime/types'
import { addComponent, addImports, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { buildWidthLadder } from './runtime/utils/cloudflare-url'

export interface ModuleOptions {
  /** Zone that serves `/cdn-cgi/image/`. Defaults to `runtimeConfig.public.imageTransformHost`. */
  transformHost?: string
  /** Origin prefixed onto path-only assets. Defaults to `runtimeConfig.public.cmsAssetOrigin`. */
  assetOrigin?: string
  /** Srcset candidate widths in px. Default: geometric ladder from 320 to 2000. */
  srcsetWidths?: number[]
  /** Default `quality` option. Default: 80. */
  defaultQuality?: number
  /** Default `format` option. Default: `auto`. */
  defaultFormat?: string
  /** Global component name. Default: `AppImage`. */
  componentName?: string
}

function stripSlash(value: string) {
  return value.replace(/\/+$/, '')
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-cloudflare-image-statamic',
    configKey: 'cloudflareImage',
    compatibility: { nuxt: '>=3.13.0' },
  },
  defaults: {
    componentName: 'AppImage',
    defaultQuality: 80,
    defaultFormat: 'auto',
  },
  setup(options, nuxt) {
    const transformHost = stripSlash(String(
      options.transformHost
      || nuxt.options.runtimeConfig.public.imageTransformHost
      || '',
    ))
    const assetOrigin = stripSlash(String(
      options.assetOrigin
      || nuxt.options.runtimeConfig.public.cmsAssetOrigin
      || '',
    ))

    if (!transformHost || !assetOrigin) {
      useLogger('nuxt-cloudflare-image-statamic').warn(
        'Missing transformHost and/or assetOrigin. Set `cloudflareImage.transformHost` / `assetOrigin`, '
        + 'or `runtimeConfig.public.imageTransformHost` / `cmsAssetOrigin` '
        + '(env: `NUXT_PUBLIC_IMAGE_TRANSFORM_HOST`, `NUXT_PUBLIC_CMS_ASSET_ORIGIN`).',
      )
    }

    // Hosts stay on their own public keys so `NUXT_PUBLIC_IMAGE_TRANSFORM_HOST`
    // and `NUXT_PUBLIC_CMS_ASSET_ORIGIN` override them at runtime. The baked
    // object is the fallback `useAppImage` reads for the srcset ladder.
    if (transformHost)
      nuxt.options.runtimeConfig.public.imageTransformHost ||= transformHost
    if (assetOrigin)
      nuxt.options.runtimeConfig.public.cmsAssetOrigin ||= assetOrigin

    // not a defu default: defu concatenates arrays, which would merge a
    // user-supplied ladder with the default one
    const srcsetWidths = options.srcsetWidths ?? buildWidthLadder()

    nuxt.options.runtimeConfig.public.cloudflareImage = {
      transformHost,
      assetOrigin,
      srcsetWidths,
      defaultQuality: options.defaultQuality ?? 80,
      defaultFormat: options.defaultFormat ?? 'auto',
    } satisfies CloudflareImageConfig

    const resolver = createResolver(import.meta.url)
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolver.resolve('./runtime/schema.d.ts') })
    })
    addComponent({
      name: options.componentName ?? 'AppImage',
      filePath: resolver.resolve('./runtime/components/AppImage.vue'),
    })
    addImports({
      name: 'useAppImage',
      as: 'useAppImage',
      from: resolver.resolve('./runtime/composables/useAppImage'),
    })
  },
})
