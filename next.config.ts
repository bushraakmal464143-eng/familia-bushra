import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/camping/register",
          destination: `${backendUrl}/api/camping/register`,
        },
        {
          source: "/api/camping/login",
          destination: `${backendUrl}/api/camping/login`,
        },
        {
          source: "/api/camping/logout",
          destination: `${backendUrl}/api/camping/logout`,
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
