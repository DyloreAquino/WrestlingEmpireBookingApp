import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/adapter-pg', 'pg', '@prisma/client', '@prisma/engines'],
};

export default nextConfig;
