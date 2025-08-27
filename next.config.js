/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  staticPageGenerationTimeout: 60,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
};

module.exports = nextConfig;
