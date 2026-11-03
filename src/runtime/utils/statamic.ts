import type { FocalPoint, StatamicImage } from '../types'

export function normalizeSrc(src: string | StatamicImage | readonly StatamicImage[]): StatamicImage {
  if (typeof src === 'string')
    return { url: src }
  // Statamic often returns a single asset as a one-element array. `Array.isArray`
  // does not narrow this union (an interface can itself be an array), so the
  // cast is the branch, not a guess about the fields.
  if (Array.isArray(src))
    return (src[0] as StatamicImage | undefined) ?? {}
  return src as StatamicImage
}

export function toPositiveNumber(value: number | string | null | undefined): number | undefined {
  if (value === undefined || value === null || value === '')
    return undefined
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/**
 * Absolute permalink when the CMS sent one, otherwise a path.
 * `buildCloudflareImageUrl` turns a path into a fetchable origin URL.
 */
export function resolveSource(image: StatamicImage): string | null {
  const raw = image.permalink ?? image.url
  if (!raw)
    return null
  if (/^https?:\/\//i.test(raw))
    return raw
  return raw.startsWith('/') ? raw : `/${raw}`
}

export function resolveAlt(image: StatamicImage, altProp: string | undefined): string | undefined {
  return altProp ?? image.alt ?? undefined
}

export function parseFocalPoint(image: StatamicImage, focusProp: string | undefined): FocalPoint | null {
  const raw = focusProp ?? image.focus ?? image.focus_css
  if (!raw)
    return null
  const parts = raw.includes('-')
    ? raw.split('-')
    : raw.replace(/%/g, '').trim().split(/\s+/)
  const x = Number.parseFloat(parts[0] ?? '')
  const y = Number.parseFloat(parts[1] ?? '')
  if (Number.isNaN(x) || Number.isNaN(y))
    return null
  // Statamic's default is the centre. Emitting it would still crop, but it
  // matches Cloudflare's own default, so there is nothing to request.
  if (x === 50 && y === 50)
    return null
  return { x, y }
}

export function resolveDimensions(
  image: StatamicImage,
  overrides: { width?: number | string, height?: number | string, aspectRatio?: number },
): { width?: number, height?: number } {
  const width = toPositiveNumber(overrides.width) ?? toPositiveNumber(image.width)
  const height = toPositiveNumber(overrides.height) ?? toPositiveNumber(image.height)
  const ratio = overrides.aspectRatio
  if (ratio && width)
    return { width, height: Math.round(width / ratio) }
  if (ratio && height)
    return { width: Math.round(height * ratio), height }
  return { width, height }
}
