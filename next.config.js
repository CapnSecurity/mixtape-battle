/** @type {import('next').NextConfig} */

// Security headers are set here (not in middleware) so statically rendered pages stay static.
//
// CSP architecture (see SECURITY-HARDENING.md): a static-compatible policy. Next.js injects inline
// bootstrap scripts into every page, so a strict `script-src` needs per-request nonces, which force
// dynamic rendering for the whole app. Experimental SRI does not cover those inline scripts
// (verified: it only adds integrity attributes to external chunks). `'unsafe-inline'` is therefore
// kept for scripts only; every other directive is tight.
//
// The policy is Report-Only. Do not switch to enforcing without reviewing collected reports.
const isDev = process.env.NODE_ENV !== 'production'

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  // Inline style attributes (React style props, Tailwind) require 'unsafe-inline'.
  // fonts.googleapis.com serves the stylesheet imported in app/globals.css.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Album art comes from iTunes (mzstatic), Cover Art Archive (redirects to archive.org) and Last.fm.
  "img-src 'self' data: blob: https://coverartarchive.org https://archive.org https://*.archive.org https://*.mzstatic.com https://lastfm.freetls.fastly.net",
  // Client code only calls same-origin APIs; third-party APIs are called server-side.
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'report-uri /api/csp-report',
]

const securityHeaders = [
  // Conservative HSTS: 1 day, no includeSubDomains, no preload. Raise gradually
  // (1 week -> 1 month -> 6+ months) once every hostname is confirmed HTTPS-only.
  { key: 'Strict-Transport-Security', value: 'max-age=86400' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=(), browsing-topics=()',
  },
  { key: 'Content-Security-Policy-Report-Only', value: cspDirectives.join('; ') },
]

// Prerendered shells of pages that sit behind authentication. They contain no user data (data is
// fetched from /api/*), but keep them out of shared caches so a CDN rule can never serve them
// to a visitor the login middleware would have redirected.
const protectedPages = [
  '/dashboard',
  '/admin',
  '/settings',
  '/woodshed',
  '/setlist',
  '/setlist-confidence',
  '/battle',
  '/songs',
  '/songs/:id',
  '/results',
  '/add-song',
  '/add-resource',
]

const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Force fresh builds with unique IDs to prevent caching issues
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Skip type checking and linting during build (we verify locally)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    const noStore = [{ key: 'Cache-Control', value: 'private, no-store' }]
    return [
      { source: '/:path*', headers: securityHeaders },
      // API responses are per-user or sensitive (e.g. /api/csrf); never allow shared caching.
      { source: '/api/:path*', headers: noStore },
      ...protectedPages.map((source) => ({ source, headers: noStore })),
    ]
  },
}

module.exports = nextConfig
