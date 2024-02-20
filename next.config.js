const million = require('million/compiler');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  redirects: async () => {
    return [
      {
        source: '/aptos',
        destination: '/?toChain=12360001',
        permanent: true,
      },
    ];
  }
}
module.exports = million.next(nextConfig, {
  auto: { rsc: true },
});