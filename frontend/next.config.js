/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    domains: ["127.0.0.1", "localhost"],
  },
};

module.exports = nextConfig;
