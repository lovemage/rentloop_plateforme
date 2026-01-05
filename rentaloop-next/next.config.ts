import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['rentaloop.net', 'www.rentaloop.net', 'localhost:3000'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // Supabase Storage S3 - allow all project domains
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        // Supabase Storage direct - for signed URLs
        protocol: "https",
        hostname: "*.storage.supabase.co",
      },
    ],
  },
};

export default nextConfig;

