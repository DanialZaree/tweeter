import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
