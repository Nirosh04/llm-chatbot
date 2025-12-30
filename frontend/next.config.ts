import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // ← ADD THIS LINE
  // Optional: change output folder name
  distDir: 'out', // This will create 'out/' instead of '.next/'
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true, // This is mandatory for static hosting
  },
};

export default nextConfig;
