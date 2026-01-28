/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { unoptimized: true },
  serverExternalPackages: ['canvas', '@mescius/spread-sheets', '@mescius/spread-sheets-tablesheet'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({ canvas: 'commonjs canvas' });
    }
    return config;
  },
};

module.exports = nextConfig;
