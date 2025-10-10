import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gallery.tahmidul612.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
