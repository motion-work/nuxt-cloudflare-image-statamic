import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    /** Zone that serves `/cdn-cgi/image/`. Defaults to `runtimeConfig.public.imageTransformHost`. */
    transformHost?: string;
    /** Origin prefixed onto path-only assets. Defaults to `runtimeConfig.public.cmsAssetOrigin`. */
    assetOrigin?: string;
    /** Srcset candidate widths in px. Default: geometric ladder from 320 to 2000. */
    srcsetWidths?: number[];
    /** Default `quality` option. Default: 80. */
    defaultQuality?: number;
    /** Default `format` option. Default: `auto`. */
    defaultFormat?: string;
    /** Global component name. Default: `AppImage`. */
    componentName?: string;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
