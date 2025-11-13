import type { NextConfig } from "next";

const r2PublicUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || "";
const r2Hostname = r2PublicUrl ? new URL(r2PublicUrl).hostname : "";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    qualities: [65, 75],
    remotePatterns: r2Hostname
      ? [
          {
            protocol: "https",
            hostname: r2Hostname,
          },
        ]
      : [],
  },
};

export default nextConfig;
