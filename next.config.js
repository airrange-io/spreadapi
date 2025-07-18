/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
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
  ],
  
  experimental: {
    // Optimize package imports (removed @mescius packages as they're in serverExternalPackages)
    optimizePackageImports: ['antd'],
    // Better memory usage
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Avoid bundling native modules on the server
    if (isServer && nextRuntime === 'nodejs') {
      config.externals.push({
        canvas: 'commonjs canvas',
        'mock-browser': 'commonjs mock-browser',
      });
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