import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Prisma client şema değişikliklerinde Turbopack önbelleğine takılmasın
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "@prisma/client-runtime-utils",
    "prisma",
    "pg",
  ],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
