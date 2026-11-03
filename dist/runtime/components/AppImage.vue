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

<script setup>
import { computed, onMounted, ref, watch, watchEffect } from "vue";
import { useAppImage } from "../composables/useAppImage";
import { aspectRatioToFloat, isTransformable } from "../utils/cloudflare-url";
import {
  normalizeSrc,
  parseFocalPoint,
  resolveAlt,
  resolveDimensions,
  resolveSource,
  toPositiveNumber
} from "../utils/statamic";
defineOptions({ inheritAttrs: false });
const props = defineProps({
  src: { type: [String, Object, Array], required: true },
  alt: { type: String, required: false },
  focus: { type: String, required: false },
  width: { type: [Number, String], required: false },
  height: { type: [Number, String], required: false },
  aspectRatio: { type: [Number, String], required: false },
  sizes: { type: String, required: false, default: "100vw" },
  loading: { type: String, required: false, default: "lazy" },
  quality: { type: Number, required: false },
  sharpen: { type: Boolean, required: false },
  blur: { type: Number, required: false },
  crop: { type: String, required: false },
  cropGravity: { type: String, required: false },
  flip: { type: Boolean, required: false },
  flop: { type: Boolean, required: false },
  brightness: { type: Number, required: false },
  saturation: { type: Number, required: false },
  hue: { type: Number, required: false },
  contrast: { type: Number, required: false },
  optimization: { type: String, required: false },
  sepia: { type: Number, required: false },
  placeholder: { type: Boolean, required: false, default: true },
  placeholderWidth: { type: Number, required: false, default: 300 },
  placeholderQuality: { type: Number, required: false, default: 30 }
});
const { buildUrl, buildSrcSet } = useAppImage();
const image = computed(() => normalizeSrc(props.src));
const source = computed(() => resolveSource(image.value));
const transformable = computed(() => !!source.value && isTransformable(source.value));
const resolvedAlt = computed(() => resolveAlt(image.value, props.alt));
const focal = computed(() => parseFocalPoint(image.value, props.focus));
const ratioFloat = computed(() => props.aspectRatio !== void 0 ? aspectRatioToFloat(props.aspectRatio) : void 0);
const resolvedSizes = computed(() => props.loading === "lazy" ? `auto, ${props.sizes}` : props.sizes);
const dimensions = computed(
  () => resolveDimensions(image.value, {
    width: props.width,
    height: props.height,
    aspectRatio: ratioFloat.value
  })
);
const transformOptions = computed(() => ({
  aspectRatio: props.aspectRatio,
  quality: props.quality,
  sharpen: props.sharpen,
  blur: props.blur,
  crop: props.crop,
  focal: focal.value ?? void 0,
  intrinsicWidth: toPositiveNumber(image.value.width),
  intrinsicHeight: toPositiveNumber(image.value.height)
}));
const fullUrl = computed(
  () => source.value ? buildUrl(source.value, { ...transformOptions.value, width: dimensions.value.width }) : ""
);
const srcset = computed(() => source.value ? buildSrcSet(source.value, transformOptions.value) : "");
const rawUrl = computed(() => source.value ? buildUrl(source.value) : "");
const placeholderUrl = computed(
  () => source.value ? buildUrl(source.value, {
    ...transformOptions.value,
    width: props.placeholderWidth,
    quality: props.placeholderQuality
  }) : ""
);
const loaded = ref(false);
const imageRef = ref(null);
watch(
  () => props.src,
  () => {
    loaded.value = false;
  }
);
onMounted(() => {
  if (imageRef.value?.complete && imageRef.value.naturalWidth > 0)
    loaded.value = true;
});
const objectPosition = computed(() => {
  if (!focal.value || props.aspectRatio !== void 0)
    return void 0;
  return `${focal.value.x}% ${focal.value.y}%`;
});
const imageStyle = computed(() => {
  const style = {};
  if (objectPosition.value)
    style.objectPosition = objectPosition.value;
  if (props.placeholder && !loaded.value && transformable.value && placeholderUrl.value) {
    style.backgroundImage = `url('${placeholderUrl.value}')`;
    style.backgroundSize = "cover";
    if (objectPosition.value)
      style.backgroundPosition = objectPosition.value;
  }
  return Object.keys(style).length ? style : void 0;
});
function onLoad() {
  loaded.value = true;
}
if (import.meta.dev) {
  watchEffect(() => {
    if (!source.value) {
      console.warn("[AppImage] src has no usable URL", props.src);
    } else if (focal.value && ratioFloat.value && (!toPositiveNumber(image.value.width) || !toPositiveNumber(image.value.height))) {
      console.warn("[AppImage] focal point ignored: image lacks intrinsic width/height", props.src);
    }
  });
}
</script>
