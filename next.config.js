/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: 'build',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
