/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Railway RAILPACK deployments — produces a
  // self-contained build that doesn't need the full node_modules tree.
  output: 'standalone',

  // API proxying is handled by src/app/api/[...path]/route.ts at RUNTIME.
  // We previously used rewrites() here, but rewrites are evaluated at
  // `next build` time — if BACKEND_URL isn't set during the build the
  // destination is permanently baked as http://localhost:8000.
};

module.exports = nextConfig;
