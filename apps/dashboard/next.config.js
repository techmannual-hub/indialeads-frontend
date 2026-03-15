/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['indialeads-uploads.s3.ap-south-1.amazonaws.com'],
  },
};

module.exports = nextConfig;
