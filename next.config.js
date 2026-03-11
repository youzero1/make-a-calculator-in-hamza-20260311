/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['typeorm', 'better-sqlite3'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals].filter(Boolean);
      }
      config.externals.push('better-sqlite3');
    }
    return config;
  },
};

module.exports = nextConfig;
