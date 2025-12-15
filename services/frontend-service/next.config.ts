import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost/ws',
  },
  async rewrites() {
    return [
      // Communication Service
      {
        source: '/api/v1/notifications/:path*',
        destination: 'http://localhost:8003/api/v1/notifications/:path*',
      },
      {
        source: '/api/notifications/:path*',
        destination: 'http://localhost:8003/api/v1/notifications/:path*',
      },
      // Ticket Service
      {
        source: '/api/v1/tickets/:path*',
        destination: 'http://localhost:8002/api/v1/tickets/:path*',
      },
      // Auth Service (Core)
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8000/api/auth/:path*',
      },
      {
        source: '/api/permissions/:path*',
        destination: 'http://localhost:8000/api/permissions/:path*',
      },
      {
        source: '/api/employees/:path*',
        destination: 'http://localhost:8000/api/employees/:path*',
      },
      // Fallback to Auth Service (Core)
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;


