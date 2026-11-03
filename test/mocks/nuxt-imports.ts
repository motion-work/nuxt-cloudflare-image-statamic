export const testCloudflareConfig = {
  transformHost: 'https://homie.io',
  assetOrigin: 'https://homie-nwevzsmftweb.s3.gra.io.cloud.ovh.net',
  srcsetWidths: [640, 1024],
  defaultQuality: 80,
  defaultFormat: 'auto',
}

export function useRuntimeConfig() {
  return {
    public: {
      imageTransformHost: testCloudflareConfig.transformHost,
      cmsAssetOrigin: testCloudflareConfig.assetOrigin,
      cloudflareImage: testCloudflareConfig,
    },
  }
}
