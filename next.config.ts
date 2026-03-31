import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com", "cdn.agenticworkerz.com"],
  },
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ["three"],
};

export default nextConfig;
