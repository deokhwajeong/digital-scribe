import type { NextConfig } from 'next';

// NEXT_PUBLIC_DEMO=1 produces a fully static export for GitHub Pages,
// served from /demos/digital-scribe (override with DEMO_BASE_PATH).
const isDemo = process.env.NEXT_PUBLIC_DEMO === '1';
const basePath = isDemo ? (process.env.DEMO_BASE_PATH ?? '/demos/digital-scribe') : '';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(isDemo && {
    output: 'export',
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
