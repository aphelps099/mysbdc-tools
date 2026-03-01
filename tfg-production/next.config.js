/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Railway RAILPACK deployments — produces a
  // self-contained build that doesn't need the full node_modules tree.
  output: 'standalone',

  // API proxying is handled by src/app/api/[...path]/route.ts at RUNTIME.
  // Set BACKEND_URL env var to point to the shared sbdc-advisor backend.
};

module.exports = nextConfig;
