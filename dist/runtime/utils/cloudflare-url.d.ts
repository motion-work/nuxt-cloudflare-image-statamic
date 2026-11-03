import type { CloudflareImageConfig, CloudflareTransformOptions, FocalPoint } from '../types.js';
export declare function buildWidthLadder(minWidth?: number, maxWidth?: number, step?: number): number[];
export declare const DEFAULT_SRCSET_WIDTHS: number[];
export declare function isTransformable(source: string): boolean;
export declare function aspectRatioToFloat(ratio: number | string): number;
/**
 * Width of the aspect-ratio crop that fits inside the source. Srcset
 * candidates above it would only upscale the already-cropped frame.
 */
export declare function computeFocalCrop(intrinsicWidth: number, intrinsicHeight: number, targetRatio: number, _focal: FocalPoint): {
    width: number;
    height: number;
};
export declare function resolveSourceUrl(source: string, assetOrigin: string): string;
/** Statamic stores focus as percentages. Cloudflare gravity is a 0–1 fraction. */
export declare function formatGravity(percent: number): string;
/**
 * `https://<zone>/cdn-cgi/image/<options>/<absolute source>`
 *
 * The source stays a full URL (the public bucket). Path-only values are
 * prefixed with `assetOrigin`. Raster files get Cloudflare options; SVG and
 * other non-transformable files are returned unchanged.
 */
export declare function buildCloudflareImageUrl(source: string, config: CloudflareImageConfig, options?: CloudflareTransformOptions): string;
export declare function buildSrcSet(source: string, config: CloudflareImageConfig, options?: CloudflareTransformOptions, widths?: number[]): string;
