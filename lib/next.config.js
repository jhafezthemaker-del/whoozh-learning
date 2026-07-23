/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development'

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src 'self' blob: data:;
  connect-src * ${isDev ? 'ws:' : ''};
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self' <https://docs.google.com>;
`

const securityHeaders = [
  {
    key: 'Permissions-Policy',
    // allow microphone access from any origin within the document
    value: 'microphone=(self)',
  },
  {
    key: 'Feature-Policy',
    value: "microphone=(self)", // Older header for Permissions-Policy
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig