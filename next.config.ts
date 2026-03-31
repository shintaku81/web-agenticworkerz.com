import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com", "cdn.agenticworkerz.com"],
  },
  transpilePackages: ["three"],
};

export default nextConfig;
