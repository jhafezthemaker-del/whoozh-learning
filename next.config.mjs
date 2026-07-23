/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', 
          },
          // 1. Fully defined CSP to stop the "Failure to Define Directive" warnings
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
          // 2. Fixes the Cross-Origin-Resource-Policy warning
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          // 3. Fixes Non-Storable Content rules for standard pages
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate',
          }
        ],
      },
    ];
  },
}

export default nextConfig