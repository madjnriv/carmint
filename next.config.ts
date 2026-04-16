import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    qualities: [25, 75],
    remotePatterns: [
      {hostname: "*"}
    ]
  }
};

export default nextConfig;
