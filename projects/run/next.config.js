/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { unoptimized: true },
  serverExternalPackages: ['canvas', '@mescius/spread-sheets', '@mescius/spread-sheets-tablesheet'],
  // Turbopack config (Next.js 16 default)
  turbopack: {},
  // Webpack fallback for canvas
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({ canvas: 'commonjs canvas' });
    }
    return config;
  },
};

module.exports = nextConfig;
