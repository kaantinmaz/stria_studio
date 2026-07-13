import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8002", pathname: "/storage/**" },
      { protocol: "http", hostname: "localhost", port: "8002", pathname: "/storage/**" },
      // Production: cover/gallery images are served by the Laravel backend.
      { protocol: "https", hostname: "admin.striastudio.com.tr", pathname: "/storage/**" },
    ],
  },
};

export default nextConfig;
