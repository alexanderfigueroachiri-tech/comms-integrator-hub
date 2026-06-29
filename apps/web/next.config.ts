import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cih/shared", "@cih/database"],
};

export default nextConfig;
