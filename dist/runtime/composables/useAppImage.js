import { useRuntimeConfig } from "#imports";
import { buildCloudflareImageUrl, buildSrcSet, DEFAULT_SRCSET_WIDTHS } from "../utils/cloudflare-url.js";
function stripSlash(value) {
  return value.replace(/\/+$/, "");
}
export function useAppImage() {
  const config = useRuntimeConfig();
  function imageConfig() {
    const baked = config.public.cloudflareImage;
    return {
      transformHost: stripSlash(config.public.imageTransformHost || baked?.transformHost || ""),
      assetOrigin: stripSlash(config.public.cmsAssetOrigin || baked?.assetOrigin || ""),
      srcsetWidths: baked?.srcsetWidths?.length ? baked.srcsetWidths : DEFAULT_SRCSET_WIDTHS,
      defaultQuality: baked?.defaultQuality ?? 80,
      defaultFormat: baked?.defaultFormat ?? "auto"
    };
  }
  return {
    get config() {
      return imageConfig();
    },
    buildUrl: (source, options = {}) => buildCloudflareImageUrl(source, imageConfig(), options),
    buildSrcSet: (source, options = {}) => buildSrcSet(source, imageConfig(), options)
  };
}
