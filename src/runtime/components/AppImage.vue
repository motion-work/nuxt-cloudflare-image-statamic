<template>
  <img
    v-if="source && transformable"
    ref="imageRef"
    :src="fullUrl"
    :srcset="srcset"
    :sizes="resolvedSizes"
    :alt="resolvedAlt"
    :width="dimensions.width"
    :height="dimensions.height"
    :loading="loading"
    decoding="async"
    v-bind="$attrs"
    :style="imageStyle"
    @load="onLoad"
  />
  <img
    v-else-if="source"
    :src="rawUrl"
    :alt="resolvedAlt"
    :width="dimensions.width"
    :height="dimensions.height"
    :loading="loading"
    decoding="async"
    v-bind="$attrs"
    :style="imageStyle"
  />
</template>

<script setup lang="ts">
import type { StatamicImage } from '../types'
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useAppImage } from '../composables/useAppImage'
import { aspectRatioToFloat, isTransformable } from '../utils/cloudflare-url'
import {
  normalizeSrc,
  parseFocalPoint,
  resolveAlt,
  resolveDimensions,
  resolveSource,
  toPositiveNumber,
} from '../utils/statamic'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    src: string | StatamicImage | readonly StatamicImage[]
    alt?: string
    focus?: string
    width?: number | string
    height?: number | string
    aspectRatio?: number | string
    sizes?: string
    loading?: 'eager' | 'lazy'
    quality?: number
    sharpen?: boolean
    blur?: number
    crop?: string
    cropGravity?: string
    flip?: boolean
    flop?: boolean
    brightness?: number
    saturation?: number
    hue?: number
    contrast?: number
    optimization?: string
    sepia?: number
    placeholder?: boolean
    placeholderWidth?: number
    placeholderQuality?: number
  }>(),
  {
    sizes: '100vw',
    loading: 'lazy',
    placeholder: true,
    placeholderWidth: 300,
    placeholderQuality: 30,
  },
)

const { buildUrl, buildSrcSet } = useAppImage()

const image = computed(() => normalizeSrc(props.src))
const source = computed(() => resolveSource(image.value))
const transformable = computed(() => !!source.value && isTransformable(source.value))
const resolvedAlt = computed(() => resolveAlt(image.value, props.alt))
const focal = computed(() => parseFocalPoint(image.value, props.focus))
const ratioFloat = computed(() => (props.aspectRatio !== undefined ? aspectRatioToFloat(props.aspectRatio) : undefined))
const resolvedSizes = computed(() => (props.loading === 'lazy' ? `auto, ${props.sizes}` : props.sizes))
const dimensions = computed(() =>
  resolveDimensions(image.value, {
    width: props.width,
    height: props.height,
    aspectRatio: ratioFloat.value,
  }),
)
const transformOptions = computed(() => ({
  aspectRatio: props.aspectRatio,
  quality: props.quality,
  sharpen: props.sharpen,
  blur: props.blur,
  crop: props.crop,
  focal: focal.value ?? undefined,
  intrinsicWidth: toPositiveNumber(image.value.width),
  intrinsicHeight: toPositiveNumber(image.value.height),
}))
const fullUrl = computed(() =>
  source.value ? buildUrl(source.value, { ...transformOptions.value, width: dimensions.value.width }) : '',
)
const srcset = computed(() => (source.value ? buildSrcSet(source.value, transformOptions.value) : ''))
const rawUrl = computed(() => (source.value ? buildUrl(source.value) : ''))
const placeholderUrl = computed(() =>
  source.value
    ? buildUrl(source.value, {
        ...transformOptions.value,
        width: props.placeholderWidth,
        quality: props.placeholderQuality,
      })
    : '',
)

const loaded = ref(false)
const imageRef = ref<HTMLImageElement | null>(null)

watch(
  () => props.src,
  () => {
    loaded.value = false
  },
)

onMounted(() => {
  if (imageRef.value?.complete && imageRef.value.naturalWidth > 0)
    loaded.value = true
})

// A Cloudflare aspect crop already frames the focus point. Without one, the
// browser crop (`object-cover`) has to use the same point via `object-position`.
const objectPosition = computed(() => {
  if (!focal.value || props.aspectRatio !== undefined)
    return undefined
  return `${focal.value.x}% ${focal.value.y}%`
})

const imageStyle = computed(() => {
  const style: Record<string, string> = {}
  if (objectPosition.value)
    style.objectPosition = objectPosition.value
  if (props.placeholder && !loaded.value && transformable.value && placeholderUrl.value) {
    style.backgroundImage = `url('${placeholderUrl.value}')`
    style.backgroundSize = 'cover'
    if (objectPosition.value)
      style.backgroundPosition = objectPosition.value
  }
  return Object.keys(style).length ? style : undefined
})

function onLoad() {
  loaded.value = true
}

if (import.meta.dev) {
  watchEffect(() => {
    if (!source.value) {
      console.warn('[AppImage] src has no usable URL', props.src)
    } else if (
      focal.value &&
      ratioFloat.value &&
      (!toPositiveNumber(image.value.width) || !toPositiveNumber(image.value.height))
    ) {
      console.warn('[AppImage] focal point ignored: image lacks intrinsic width/height', props.src)
    }
  })
}
</script>
