/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, 'axios', 'uuid', 'supports-color'];
    }
    return config;
  }
}

module.exports = nextConfig