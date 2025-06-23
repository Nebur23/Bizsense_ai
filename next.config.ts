import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        port: "",
        pathname: "/api/portraits/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "**",
      },
    ],
    dangerouslyAllowSVG: true,

    contentDispositionType: "attachment",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
