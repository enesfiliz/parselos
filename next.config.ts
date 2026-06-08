import type { NextConfig } from "next";

const isHostingerBuild = process.env.HOSTINGER_BUILD === "1";

const nextConfig: NextConfig = {
  // Standalone yalnızca Hostinger VPS/PM2 için; Vercel kendi çıktısını kullanır.
  ...(isHostingerBuild ? { output: "standalone" as const } : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
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
