import type { CloudflareImageConfig, CloudflareTransformOptions, FocalPoint } from '../types'

export function buildWidthLadder(minWidth = 320, maxWidth = 2000, step = 1.2): number[] {
  const widths: number[] = []
  for (let w = minWidth; w * step <= maxWidth; w = Math.round(w * step)) {
    widths.push(w)
  }
  widths.push(maxWidth)
  return widths
}

export const DEFAULT_SRCSET_WIDTHS = buildWidthLadder()

const TRANSFORMABLE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']

export function isTransformable(source: string): boolean {
  const path = source.split('?')[0] ?? source
  const ext = /\.([^./]+)$/.exec(path)?.[1]
  return !!ext && TRANSFORMABLE_EXTENSIONS.includes(ext.toLowerCase())
}

export function aspectRatioToFloat(ratio: number | string): number {
  if (typeof ratio === 'number')
    return ratio
  if (ratio.includes(':')) {
    const [w, h] = ratio.split(':')
    return Number.parseFloat(w ?? '') / Number.parseFloat(h ?? '')
  }
  return Number.parseFloat(ratio)
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/**
 * Width of the aspect-ratio crop that fits inside the source. Srcset
 * candidates above it would only upscale the already-cropped frame.
 */
export function computeFocalCrop(
  intrinsicWidth: number,
  intrinsicHeight: number,
  targetRatio: number,
  _focal: FocalPoint,
): { width: number, height: number } {
  let width = intrinsicWidth
  let height = Math.round(intrinsicWidth / targetRatio)
  if (height > intrinsicHeight) {
    height = intrinsicHeight
    width = Math.round(intrinsicHeight * targetRatio)
  }
  return { width, height }
}

export function resolveSourceUrl(source: string, assetOrigin: string): string {
  const trimmed = source.trim()
  if (/^https?:\/\//i.test(trimmed))
    return trimmed
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${assetOrigin.replace(/\/+$/, '')}${path}`
}

/** Statamic stores focus as percentages. Cloudflare gravity is a 0–1 fraction. */
export function formatGravity(percent: number): string {
  return String(Number(clamp(percent, 0, 100) / 100).toFixed(4)).replace(/\.?0+$/, '')
}

function effectiveMaxWidth(options: CloudflareTransformOptions): number | undefined {
  if (
    options.aspectRatio !== undefined
    && options.crop !== 'limit'
    && !options.crop
    && options.focal
    && options.intrinsicWidth
    && options.intrinsicHeight
  ) {
    const ratio = aspectRatioToFloat(options.aspectRatio)
    if (Number.isFinite(ratio) && ratio > 0) {
      return computeFocalCrop(options.intrinsicWidth, options.intrinsicHeight, ratio, options.focal).width
    }
  }
  return options.intrinsicWidth
}

function buildOptionList(options: CloudflareTransformOptions, config: CloudflareImageConfig): string[] {
  const params: string[] = []
  const width = options.width !== undefined ? Number(options.width) : undefined
  const hasWidth = width !== undefined && Number.isFinite(width) && width > 0

  let height: number | undefined
  let fit: string | undefined
  let gravity: string | undefined

  if (options.crop === 'limit') {
    fit = 'scale-down'
  }
  else if (options.aspectRatio !== undefined && hasWidth && !options.crop) {
    const ratio = aspectRatioToFloat(options.aspectRatio)
    if (Number.isFinite(ratio) && ratio > 0) {
      height = Math.round(width! / ratio)
      // Crop to the requested frame without upscaling. Gravity keeps the
      // Statamic focus point when the editor set one.
      fit = 'aspect-crop'
      if (options.focal && options.intrinsicWidth && options.intrinsicHeight) {
        gravity = `${formatGravity(options.focal.x)}x${formatGravity(options.focal.y)}`
      }
    }
  }

  if (hasWidth)
    params.push(`width=${Math.round(width!)}`)
  if (height)
    params.push(`height=${height}`)
  if (fit)
    params.push(`fit=${fit}`)
  if (gravity)
    params.push(`gravity=${gravity}`)

  const quality = options.quality ?? config.defaultQuality
  if (quality)
    params.push(`quality=${quality}`)
  if (config.defaultFormat)
    params.push(`format=${config.defaultFormat}`)
  if (options.sharpen)
    params.push('sharpen=1')
  if (options.blur)
    params.push(`blur=${clamp(options.blur, 0, 250)}`)

  return params
}

/**
 * `https://<zone>/cdn-cgi/image/<options>/<absolute source>`
 *
 * The source stays a full URL (the public bucket). Path-only values are
 * prefixed with `assetOrigin`. Raster files get Cloudflare options; SVG and
 * other non-transformable files are returned unchanged.
 */
export function buildCloudflareImageUrl(
  source: string,
  config: CloudflareImageConfig,
  options: CloudflareTransformOptions = {},
): string {
  const sourceUrl = resolveSourceUrl(source, config.assetOrigin)
  if (!isTransformable(sourceUrl))
    return sourceUrl

  const host = config.transformHost.replace(/\/+$/, '')
  const params = buildOptionList(options, config)
  if (!params.length)
    return sourceUrl

  return `${host}/cdn-cgi/image/${params.join(',')}/${sourceUrl}`
}

export function buildSrcSet(
  source: string,
  config: CloudflareImageConfig,
  options: CloudflareTransformOptions = {},
  widths: number[] = config.srcsetWidths,
): string {
  const sourceUrl = resolveSourceUrl(source, config.assetOrigin)
  if (!isTransformable(sourceUrl))
    return ''

  const ladder = widths.filter(width => Number.isFinite(width) && width > 0).sort((a, b) => a - b)
  const maxWidth = effectiveMaxWidth(options)
  let candidates = ladder
  if (maxWidth) {
    candidates = ladder.filter(width => width < maxWidth)
    if (maxWidth <= (ladder[ladder.length - 1] ?? 0))
      candidates.push(maxWidth)
  }

  return candidates
    .map(width => `${buildCloudflareImageUrl(source, config, { ...options, width, height: undefined })} ${width}w`)
    .join(', ')
}
