import type { NextConfig } from "next";

const r2PublicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || "";
const r2Hostname = r2PublicUrl ? new URL(r2PublicUrl).hostname : "";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
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
