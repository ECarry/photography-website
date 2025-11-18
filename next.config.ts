import type { NextConfig } from "next";

const s3PublicUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || "";
const s3Hostname = s3PublicUrl ? new URL(s3PublicUrl).hostname : "";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    qualities: [65, 75],
    remotePatterns: s3Hostname
      ? [
          {
            protocol: "https",
            hostname: s3Hostname,
          },
        ]
      : [],
  },
};

export default nextConfig;
