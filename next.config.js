/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        return config;
    },
}

// const withVercelToolbar = require('@vercel/toolbar/plugins/next')();
// Instead of module.exports = nextConfig, do this:
module.exports = nextConfig;