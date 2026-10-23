import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.FIGMA === "1" && process.env.NODE_ENV === "production"
    ? { output: "standalone" }
    : {}),
};

export default nextConfig;
