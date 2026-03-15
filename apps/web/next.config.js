/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export", // static export for CDN hosting
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
