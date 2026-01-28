/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({ canvas: 'commonjs canvas' });
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['canvas', '@mescius/spread-sheets'],
  },
};

module.exports = nextConfig;
