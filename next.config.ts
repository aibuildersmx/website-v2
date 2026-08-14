import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "html.tailus.io",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/aibmday",
        destination: "/aibmday.pdf",
      },
    ];
  },
  async redirects() {
    // The editorial blog now lives on the regional AI Builders LAT site.
    return [
      {
        source: "/blog",
        destination: "https://aibuilders.lat",
        permanent: true,
      },
      {
        source: "/blog/:path*",
        destination: "https://aibuilders.lat/:path*",
        permanent: true,
      },
      {
        source: "/segundo-cerebro-cursor",
        destination: "https://aibuilders.lat/segundo-cerebro-cursor",
        permanent: true,
      },
      {
        source: "/guia-openclaw",
        destination: "https://aibuilders.lat/guia-openclaw",
        permanent: true,
      },
      {
        source: "/integracion-google",
        destination: "https://aibuilders.lat/integracion-google",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
