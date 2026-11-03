export function buildWidthLadder(minWidth = 320, maxWidth = 2e3, step = 1.2) {
  const widths = [];
  for (let w = minWidth; w * step <= maxWidth; w = Math.round(w * step)) {
    widths.push(w);
  }
  widths.push(maxWidth);
  return widths;
}
export const DEFAULT_SRCSET_WIDTHS = buildWidthLadder();
const TRANSFORMABLE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif"];
export function isTransformable(source) {
  const path = source.split("?")[0] ?? source;
  const ext = /\.([^./]+)$/.exec(path)?.[1];
  return !!ext && TRANSFORMABLE_EXTENSIONS.includes(ext.toLowerCase());
}
export function aspectRatioToFloat(ratio) {
  if (typeof ratio === "number")
    return ratio;
  if (ratio.includes(":")) {
    const [w, h] = ratio.split(":");
    return Number.parseFloat(w ?? "") / Number.parseFloat(h ?? "");
  }
  return Number.parseFloat(ratio);
}
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export function computeFocalCrop(intrinsicWidth, intrinsicHeight, targetRatio, _focal) {
  let width = intrinsicWidth;
  let height = Math.round(intrinsicWidth / targetRatio);
  if (height > intrinsicHeight) {
    height = intrinsicHeight;
    width = Math.round(intrinsicHeight * targetRatio);
  }
  return { width, height };
}
export function resolveSourceUrl(source, assetOrigin) {
  const trimmed = source.trim();
  if (/^https?:\/\//i.test(trimmed))
    return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${assetOrigin.replace(/\/+$/, "")}${path}`;
}
export function formatGravity(percent) {
  return String(Number(clamp(percent, 0, 100) / 100).toFixed(4)).replace(/\.?0+$/, "");
}
function effectiveMaxWidth(options) {
  if (options.aspectRatio !== void 0 && options.crop !== "limit" && !options.crop && options.focal && options.intrinsicWidth && options.intrinsicHeight) {
    const ratio = aspectRatioToFloat(options.aspectRatio);
    if (Number.isFinite(ratio) && ratio > 0) {
      return computeFocalCrop(options.intrinsicWidth, options.intrinsicHeight, ratio, options.focal).width;
    }
  }
  return options.intrinsicWidth;
}
function buildOptionList(options, config) {
  const params = [];
  const width = options.width !== void 0 ? Number(options.width) : void 0;
  const hasWidth = width !== void 0 && Number.isFinite(width) && width > 0;
  let height;
  let fit;
  let gravity;
  if (options.crop === "limit") {
    fit = "scale-down";
  } else if (options.aspectRatio !== void 0 && hasWidth && !options.crop) {
    const ratio = aspectRatioToFloat(options.aspectRatio);
    if (Number.isFinite(ratio) && ratio > 0) {
      height = Math.round(width / ratio);
      fit = "aspect-crop";
      if (options.focal && options.intrinsicWidth && options.intrinsicHeight) {
        gravity = `${formatGravity(options.focal.x)}x${formatGravity(options.focal.y)}`;
      }
    }
  }
  if (hasWidth)
    params.push(`width=${Math.round(width)}`);
  if (height)
    params.push(`height=${height}`);
  if (fit)
    params.push(`fit=${fit}`);
  if (gravity)
    params.push(`gravity=${gravity}`);
  const quality = options.quality ?? config.defaultQuality;
  if (quality)
    params.push(`quality=${quality}`);
  if (config.defaultFormat)
    params.push(`format=${config.defaultFormat}`);
  if (options.sharpen)
    params.push("sharpen=1");
  if (options.blur)
    params.push(`blur=${clamp(options.blur, 0, 250)}`);
  return params;
}
export function buildCloudflareImageUrl(source, config, options = {}) {
  const sourceUrl = resolveSourceUrl(source, config.assetOrigin);
  if (!isTransformable(sourceUrl))
    return sourceUrl;
  const host = config.transformHost.replace(/\/+$/, "");
  const params = buildOptionList(options, config);
  if (!params.length)
    return sourceUrl;
  return `${host}/cdn-cgi/image/${params.join(",")}/${sourceUrl}`;
}
export function buildSrcSet(source, config, options = {}, widths = config.srcsetWidths) {
  const sourceUrl = resolveSourceUrl(source, config.assetOrigin);
  if (!isTransformable(sourceUrl))
    return "";
  const ladder = widths.filter((width) => Number.isFinite(width) && width > 0).sort((a, b) => a - b);
  const maxWidth = effectiveMaxWidth(options);
  let candidates = ladder;
  if (maxWidth) {
    candidates = ladder.filter((width) => width < maxWidth);
    if (maxWidth <= (ladder[ladder.length - 1] ?? 0))
      candidates.push(maxWidth);
  }
  return candidates.map((width) => `${buildCloudflareImageUrl(source, config, { ...options, width, height: void 0 })} ${width}w`).join(", ");
}
