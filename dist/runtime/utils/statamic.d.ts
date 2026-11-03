import type { FocalPoint, StatamicImage } from '../types.js';
export declare function normalizeSrc(src: string | StatamicImage | readonly StatamicImage[]): StatamicImage;
export declare function toPositiveNumber(value: number | string | null | undefined): number | undefined;
/**
 * Absolute permalink when the CMS sent one, otherwise a path.
 * `buildCloudflareImageUrl` turns a path into a fetchable origin URL.
 */
export declare function resolveSource(image: StatamicImage): string | null;
export declare function resolveAlt(image: StatamicImage, altProp: string | undefined): string | undefined;
export declare function parseFocalPoint(image: StatamicImage, focusProp: string | undefined): FocalPoint | null;
export declare function resolveDimensions(image: StatamicImage, overrides: {
    width?: number | string;
    height?: number | string;
    aspectRatio?: number;
}): {
    width?: number;
    height?: number;
};
