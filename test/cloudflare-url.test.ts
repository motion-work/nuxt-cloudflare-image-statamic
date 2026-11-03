import type { CloudflareImageConfig } from '../src/runtime/types'
import { describe, expect, it } from 'vitest'
import { buildCloudflareImageUrl, buildSrcSet, buildWidthLadder } from '../src/runtime/utils/cloudflare-url'
import { normalizeSrc, parseFocalPoint } from '../src/runtime/utils/statamic'

const ORIGIN = 'https://homie-nwevzsmftweb.s3.gra.io.cloud.ovh.net'
const SOURCE = `${ORIGIN}/p/assets/team/tom-diggelmann.jpg`

const config: CloudflareImageConfig = {
  transformHost: 'https://homie.io',
  assetOrigin: ORIGIN,
  srcsetWidths: buildWidthLadder(),
  defaultQuality: 80,
  defaultFormat: 'auto',
}

describe('buildCloudflareImageUrl', () => {
  it('builds the working Cloudflare URL for an absolute Statamic permalink', () => {
    expect(buildCloudflareImageUrl(SOURCE, config, { width: 800 })).toBe(
      `https://homie.io/cdn-cgi/image/width=800,quality=80,format=auto/${SOURCE}`,
    )
  })

  it('prefixes a path-only asset with the configured origin', () => {
    expect(buildCloudflareImageUrl('/p/assets/team/tom-diggelmann.jpg', config, { width: 800 })).toBe(
      `https://homie.io/cdn-cgi/image/width=800,quality=80,format=auto/${SOURCE}`,
    )
  })

  it('keeps a legacy absolute host instead of rewriting it to the default origin', () => {
    const legacy = 'https://homie.fra1.digitaloceanspaces.com/p/assets/team/tom-diggelmann.jpg'
    expect(buildCloudflareImageUrl(legacy, config, { width: 800 })).toBe(
      `https://homie.io/cdn-cgi/image/width=800,quality=80,format=auto/${legacy}`,
    )
  })

  it('crops to an aspect ratio around the Statamic focal point', () => {
    const url = buildCloudflareImageUrl(SOURCE, config, {
      width: 400,
      aspectRatio: 1,
      focal: { x: 33, y: 66 },
      intrinsicWidth: 1200,
      intrinsicHeight: 800,
    })

    expect(url).toBe(
      `https://homie.io/cdn-cgi/image/width=400,height=400,fit=aspect-crop,gravity=0.33x0.66,quality=80,format=auto/${SOURCE}`,
    )
  })

  it('turns a 1200:630 aspect ratio into the matching output height', () => {
    const url = buildCloudflareImageUrl(SOURCE, config, {
      width: 1200,
      aspectRatio: '1200:630',
    })

    expect(url).toContain('width=1200,height=630,fit=aspect-crop,quality=80,format=auto/')
    expect(url).not.toContain('gravity=')
  })

  it('maps crop=limit to fit=scale-down', () => {
    expect(buildCloudflareImageUrl(SOURCE, config, { width: 270, crop: 'limit' })).toContain(
      'width=270,fit=scale-down,quality=80,format=auto/',
    )
  })

  it('maps sharpen to Cloudflare\'s recommended downscale amount', () => {
    expect(buildCloudflareImageUrl(SOURCE, config, { width: 800, sharpen: true })).toContain('sharpen=1')
  })

  it('returns an SVG unchanged', () => {
    const svg = `${ORIGIN}/p/assets/logo.svg`
    expect(buildCloudflareImageUrl(svg, config, { width: 200 })).toBe(svg)
  })
})

describe('statamic assets', () => {
  it('reads a Statamic asset object, including a one-element array and focus_css', () => {
    const asset = {
      permalink: SOURCE,
      width: 1200,
      height: 800,
      alt: 'Tom',
      focus_css: '33% 66%',
    }

    expect(normalizeSrc([asset])).toEqual(asset)
    expect(parseFocalPoint(asset, undefined)).toEqual({ x: 33, y: 66 })
    expect(parseFocalPoint({ focus_css: '50% 50%' }, undefined)).toBeNull()
  })
})

describe('buildSrcSet', () => {
  it('caps candidates at the asset\'s intrinsic width', () => {
    const srcset = buildSrcSet(SOURCE, config, { intrinsicWidth: 800 }, [320, 640, 1280, 2000])

    expect(srcset).toContain(' 320w')
    expect(srcset).toContain(' 640w')
    expect(srcset).toContain(' 800w')
    expect(srcset).not.toContain(' 1280w')
    expect(srcset).not.toContain(' 2000w')
  })

  it('returns nothing for an SVG', () => {
    expect(buildSrcSet(`${ORIGIN}/p/assets/logo.svg`, config)).toBe('')
  })
})
