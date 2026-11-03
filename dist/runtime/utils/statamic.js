export function normalizeSrc(src) {
  if (typeof src === "string")
    return { url: src };
  if (Array.isArray(src))
    return src[0] ?? {};
  return src;
}
export function toPositiveNumber(value) {
  if (value === void 0 || value === null || value === "")
    return void 0;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : void 0;
}
export function resolveSource(image) {
  const raw = image.permalink ?? image.url;
  if (!raw)
    return null;
  if (/^https?:\/\//i.test(raw))
    return raw;
  return raw.startsWith("/") ? raw : `/${raw}`;
}
export function resolveAlt(image, altProp) {
  return altProp ?? image.alt ?? void 0;
}
export function parseFocalPoint(image, focusProp) {
  const raw = focusProp ?? image.focus ?? image.focus_css;
  if (!raw)
    return null;
  const parts = raw.includes("-") ? raw.split("-") : raw.replace(/%/g, "").trim().split(/\s+/);
  const x = Number.parseFloat(parts[0] ?? "");
  const y = Number.parseFloat(parts[1] ?? "");
  if (Number.isNaN(x) || Number.isNaN(y))
    return null;
  if (x === 50 && y === 50)
    return null;
  return { x, y };
}
export function resolveDimensions(image, overrides) {
  const width = toPositiveNumber(overrides.width) ?? toPositiveNumber(image.width);
  const height = toPositiveNumber(overrides.height) ?? toPositiveNumber(image.height);
  const ratio = overrides.aspectRatio;
  if (ratio && width)
    return { width, height: Math.round(width / ratio) };
  if (ratio && height)
    return { width: Math.round(height * ratio), height };
  return { width, height };
}
