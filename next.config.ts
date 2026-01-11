import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Strict mode for better error detection
  reactStrictMode: true,

  // Disable powered by header for security
  poweredByHeader: false,

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.sip-protocol.org",
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@sip-protocol/sdk",
      "@sip-protocol/react",
    ],
  },
}

export default nextConfig
