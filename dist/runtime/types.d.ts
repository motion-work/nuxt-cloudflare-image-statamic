export interface StatamicImage {
    url?: string | null;
    permalink?: string | null;
    alt?: string | null;
    width?: number | string | null;
    height?: number | string | null;
    /** Statamic focal point, e.g. "75-25-1" (x-y-zoom) */
    focus?: string | null;
    /** Statamic focal point, e.g. "75% 25%" */
    focus_css?: string | null;
    extension?: string | null;
    is_image?: boolean | null;
}
/** Focal point in percentages (0–100), as Statamic stores it. */
export interface FocalPoint {
    x: number;
    y: number;
}
export interface CloudflareTransformOptions {
    width?: number | string;
    height?: number | string;
    aspectRatio?: number | string;
    quality?: number;
    sharpen?: boolean;
    blur?: number;
    /**
     * `limit` maps to Cloudflare `fit=scale-down` (no crop, no upscale).
     * Other values are ignored — focal crops use `gravity`.
     */
    crop?: string;
    /** Unused. Focal crops use Cloudflare `gravity` from the Statamic focus point. */
    cropGravity?: string;
    flip?: boolean;
    flop?: boolean;
    brightness?: number;
    saturation?: number;
    hue?: number;
    contrast?: number;
    optimization?: string;
    sepia?: number;
    focal?: FocalPoint;
    intrinsicWidth?: number;
    intrinsicHeight?: number;
}
export interface CloudflareImageConfig {
    /** Zone with Image Resizing enabled, e.g. `https://homie.io`. No trailing slash. */
    transformHost: string;
    /** Absolute origin for path-only asset URLs (the OVH bucket). No trailing slash. */
    assetOrigin: string;
    srcsetWidths: number[];
    defaultQuality: number;
    defaultFormat: string;
}
