import { defineNuxtModule, useLogger, createResolver, addComponent, addImports } from '@nuxt/kit';
import { buildWidthLadder } from '../dist/runtime/utils/cloudflare-url.js';

function stripSlash(value) {
  return value.replace(/\/+$/, "");
}
const module$1 = defineNuxtModule({
  meta: {
    name: "nuxt-cloudflare-image-statamic",
    configKey: "cloudflareImage",
    compatibility: { nuxt: ">=3.13.0" }
  },
  defaults: {
    componentName: "AppImage",
    defaultQuality: 80,
    defaultFormat: "auto"
  },
  setup(options, nuxt) {
    const transformHost = stripSlash(String(
      options.transformHost || nuxt.options.runtimeConfig.public.imageTransformHost || ""
    ));
    const assetOrigin = stripSlash(String(
      options.assetOrigin || nuxt.options.runtimeConfig.public.cmsAssetOrigin || ""
    ));
    if (!transformHost || !assetOrigin) {
      useLogger("nuxt-cloudflare-image-statamic").warn(
        "Missing transformHost and/or assetOrigin. Set `cloudflareImage.transformHost` / `assetOrigin`, or `runtimeConfig.public.imageTransformHost` / `cmsAssetOrigin` (env: `NUXT_PUBLIC_IMAGE_TRANSFORM_HOST`, `NUXT_PUBLIC_CMS_ASSET_ORIGIN`)."
      );
    }
    if (transformHost)
      nuxt.options.runtimeConfig.public.imageTransformHost ||= transformHost;
    if (assetOrigin)
      nuxt.options.runtimeConfig.public.cmsAssetOrigin ||= assetOrigin;
    const srcsetWidths = options.srcsetWidths ?? buildWidthLadder();
    nuxt.options.runtimeConfig.public.cloudflareImage = {
      transformHost,
      assetOrigin,
      srcsetWidths,
      defaultQuality: options.defaultQuality ?? 80,
      defaultFormat: options.defaultFormat ?? "auto"
    };
    const resolver = createResolver(import.meta.url);
    nuxt.hook("prepare:types", ({ references }) => {
      references.push({ path: resolver.resolve("./runtime/schema.d.ts") });
    });
    addComponent({
      name: options.componentName ?? "AppImage",
      filePath: resolver.resolve("./runtime/components/AppImage.vue")
    });
    addImports({
      name: "useAppImage",
      as: "useAppImage",
      from: resolver.resolve("./runtime/composables/useAppImage")
    });
  }
});

export { module$1 as default };
