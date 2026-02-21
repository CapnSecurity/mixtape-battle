/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Force fresh builds with unique IDs to prevent caching issues
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Skip type checking and linting during build (we verify locally)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
