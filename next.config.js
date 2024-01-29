const million = require('million/compiler');
/** @type {import('next').NextConfig} */
module.exports = million.next({
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
}, {
  auto: { rsc: true },
});