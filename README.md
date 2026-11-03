# nuxt-cloudflare-image-statamic

Nuxt 4 module for rendering Statamic image objects through [Cloudflare Image Resizing](https://developers.cloudflare.com/images/transform-images/).

Inspired by [nuxt-bunny-image-statamic](https://github.com/boldwebdev/nuxt-bunny-image-statamic) and the Team Novu Statamic image components:

- Handles Statamic image objects (`permalink`/`url`, `width`, `height`)
- Auto-applies the `alt` attribute
- Auto-applies the Statamic focal point (`focus` / `focus_css`) via Cloudflare `gravity`
- Responsive `srcset` from a dense width ladder (~20% steps), capped at the image's intrinsic width
- `sizes="auto"` on lazy images — supporting browsers pick the variant from the real rendered width
- Blur-up placeholder, native lazy loading, layout-shift prevention

## Install

```bash
pnpm add nuxt-cloudflare-image-statamic
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-cloudflare-image-statamic'],
  runtimeConfig: {
    public: {
      imageTransformHost: 'https://example.com',
      cmsAssetOrigin: 'https://assets.example.com',
    },
  },
})
```

```bash
# .env — runtime overrides (recommended on deployed apps)
NUXT_PUBLIC_IMAGE_TRANSFORM_HOST=https://example.com
NUXT_PUBLIC_CMS_ASSET_ORIGIN=https://assets.example.com
```

The transform host must be a Cloudflare zone with Image Resizing enabled. Raster assets are requested as:

`https://<transform-host>/cdn-cgi/image/<options>/<absolute-source-url>`

Path-only Statamic paths are prefixed with `cmsAssetOrigin`. Absolute permalinks keep their own host. SVG and other non-raster files are not transformed.

Alternatively, set hosts in module options:

```ts
cloudflareImage: {
  transformHost: 'https://example.com',
  assetOrigin: 'https://assets.example.com',
},
```

## Usage

```vue
<!-- hand the Statamic image object straight in -->
<AppImage :src="entry.image" />

<!-- square avatar cropped around the focal point -->
<AppImage :src="entry.image" :aspect-ratio="1" sizes="4rem" />
```

Make sure your Statamic API output includes `permalink` (or `url`), `width`, `height`, `alt`, and `focus` (or `focus_css`).

## Module options (`cloudflareImage`)

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| `transformHost` | `string` | `runtimeConfig.public.imageTransformHost` | Cloudflare zone URL |
| `assetOrigin` | `string` | `runtimeConfig.public.cmsAssetOrigin` | Origin for path-only assets |
| `srcsetWidths` | `number[]` | `320 … 2000` geometric ladder | `srcset` candidate widths |
| `defaultQuality` | `number` | `80` | Default Cloudflare `quality` |
| `defaultFormat` | `string` | `auto` | Default Cloudflare `format` |
| `componentName` | `string` | `AppImage` | Global component name |

## Component props

`src` (Statamic image object or path, required), `alt`, `focus`, `width`, `height`, `aspect-ratio`, `sizes` (default `100vw`), `loading` (default `lazy`), `quality`, `sharpen`, `blur`, `crop`, `crop-gravity`, `flip`, `flop`, `brightness`, `saturation`, `hue`, `contrast`, `optimization`, `sepia`, `placeholder` (default `true`), `placeholder-width` (default `300`), `placeholder-quality` (default `30`).

### `sizes` and lazy loading

On lazy images (the default) the rendered attribute is `sizes="auto, <your value>"`. Eager images (`loading="eager"`) use your `sizes` value as-is.

## Composable

```ts
const { buildUrl, buildSrcSet } = useAppImage()
const ogImage = buildUrl('/img/hero.jpg', { width: 1200, aspectRatio: '1200:630' })
```

## Development

```bash
pnpm install
pnpm dev:prepare
pnpm test
pnpm dev
```
