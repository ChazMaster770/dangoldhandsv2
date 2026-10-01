import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images as-is: they are already web-optimized JPEGs, and this
    // avoids depending on the hosted image optimizer.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
  },
  async rewrites() {
    // fallback rewrites run only when no page/route/public file matched:
    // real files in /public win when present; if a deployment is missing
    // them, /api/img serves from the database (or a branded placeholder).
    return {
      fallback: [
        { source: "/images/:path*", destination: "/api/img?path=:path*" },
      ],
    };
  },
};

export default nextConfig;
