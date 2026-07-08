import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allow loading dev resources when the site is opened via 127.0.0.1
  // (not just localhost). Without this, Next 16 returns 403 for JS chunks →
  // hydration aborts → scroll-reveal never fires → below-hero content stays hidden.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8002", pathname: "/storage/**" },
      { protocol: "http", hostname: "localhost", port: "8002", pathname: "/storage/**" },
    ],
  },
};

export default nextConfig;
