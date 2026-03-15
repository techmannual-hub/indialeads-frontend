/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "indialeads-uploads-dev.s3.ap-south-1.amazonaws.com",
      "indialeads-uploads.s3.ap-south-1.amazonaws.com",
    ],
  },
  async rewrites() {
    // Proxy /api/* calls to the backend during development
    // In production, this is handled by nginx
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/:path*",
            destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
