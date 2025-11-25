import type { NextConfig } from "next";

const s3PublicUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || "";
const s3Url = s3PublicUrl ? new URL(s3PublicUrl) : null;
const s3Hostname = s3Url ? s3Url.hostname : "";
const s3Protocol = s3Url ? s3Url.protocol.replace(":", "") : "https";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  reactCompiler: true,
  images: {
    qualities: [65, 75],
    remotePatterns: s3Hostname
      ? [
          {
            protocol: s3Protocol as "http" | "https",
            hostname: s3Hostname,
            port: s3Url?.port || "",
          },
        ]
      : [],
  },
};

export default nextConfig;
