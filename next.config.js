/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: '/aptos',
        destination: '/?toChain=12360001',
        permanent: true,
      },
    ];
  },

  // Turbopack config (default bundler in Next.js 16)
  turbopack: {
    resolveAlias: {
      // Polyfill cross-fetch with the native fetch shim for edge runtime
      'cross-fetch': './fetch-shim.js',
    },
  },

  // Kept for any tooling that still invokes webpack explicitly
  webpack: (config, { nextRuntime }) => {
    config.resolve.fallback = { fs: false };
    config.externals.push(
      'pino-pretty',
      'lokijs',
      'encoding',
      'bufferutil',
      'utf-8-validate',
    );
    if (nextRuntime === 'edge') {
      config.resolve.alias = {
        ...config.resolve.alias,
        'cross-fetch': require.resolve('./fetch-shim.js'),
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'cross-fetch': require.resolve('./fetch-shim.js'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
