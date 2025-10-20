/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Server external packages (moved from experimental in Next.js 15)
  serverExternalPackages: [
    'canvas',
    'mock-browser',
    '@mescius/spread-sheets',
    '@mescius/spread-sheets-tablesheet',
    '@mescius/spread-sheets-charts',
    '@mescius/spread-sheets-designer',
    '@mescius/spread-sheets-designer-react',
    '@mescius/spread-sheets-designer-resources-en',
    '@mescius/spread-sheets-io',
  ],
  
  experimental: {
    // Optimize package imports (removed @mescius packages as they're in serverExternalPackages)
    optimizePackageImports: ['antd', '@ant-design/icons', 'rc-slider'],
    // Better memory usage
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config, { isServer, nextRuntime, webpack }) => {
    // Avoid bundling native modules on the server
    if (isServer && nextRuntime === 'nodejs') {
      config.externals.push({
        canvas: 'commonjs canvas',
        'mock-browser': 'commonjs mock-browser',
      });

      // Inject MutationObserver polyfill globally on server (Next.js DevTools bug workaround)
      const polyfillCode = `
        if (typeof global !== 'undefined' && typeof global.MutationObserver === 'undefined') {
          global.MutationObserver = class MutationObserver {
            constructor() {}
            observe() {}
            disconnect() {}
            takeRecords() { return []; }
          };
        }
      `;

      config.plugins.push(
        new webpack.BannerPlugin({
          banner: polyfillCode,
          raw: true,
          entryOnly: false,
        })
      );
    }

    // Ignore native modules on client
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        'mock-browser': false,
      };
    }

    return config;
  },
}

module.exports = nextConfig