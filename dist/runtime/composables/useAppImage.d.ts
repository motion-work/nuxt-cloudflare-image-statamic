import type { CloudflareImageConfig, CloudflareTransformOptions } from '../types.js';
export declare function useAppImage(): {
    readonly config: CloudflareImageConfig;
    buildUrl: (source: string, options?: CloudflareTransformOptions) => string;
    buildSrcSet: (source: string, options?: CloudflareTransformOptions) => string;
};
