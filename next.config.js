/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: [
      'canvas',
      'mock-browser',
      '@mescius/spread-sheets',
      '@mescius/spread-sheets-tablesheet',
    ],
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