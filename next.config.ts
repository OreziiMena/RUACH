import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: 'https',
        hostname: 'files.moorafrika.com', 
      },
      {
        protocol: 'https',

        hostname: 'pub-7469dba524d14670bbafe0d2b5ac899b.r2.dev', 
      },
    ],
  },
};

export default nextConfig;
