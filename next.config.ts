import type { NextConfig } from "next"
import path from "path"

// Stub module for webpack resolve.fallback — provides no-op functions
// so destructuring and util.promisify() calls don't throw at runtime.
// Uses .js extension so webpack can load it without TypeScript loader.
const emptyModule = path.resolve(process.cwd(), "src/lib/empty-module.js")

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

  // Externalize Node.js-only packages from server bundles so they resolve
  // from node_modules at runtime. @sip-protocol/sdk transitively imports
  // @triton-one/yellowstone-grpc which loads a WASM file via
  // fs.readFileSync(__dirname + '/...wasm') — bundling breaks that path.
  serverExternalPackages: [
    "@sip-protocol/sdk",
    "@grpc/grpc-js",
    "@grpc/proto-loader",
    "@triton-one/yellowstone-grpc",
    "@sunrisestake/client",
  ],

  // Stub Node.js built-ins for client bundles (webpack).
  // @sip-protocol/sdk → @triton-one/yellowstone-grpc → @grpc/grpc-js
  // pulls in dns, fs, http2, net, tls which don't exist in browsers.
  // Use the empty-module stub (not `false`) so destructuring and
  // util.promisify() calls get no-op values instead of throwing.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: emptyModule,
        fs: emptyModule,
        "fs/promises": emptyModule,
        http2: emptyModule,
        net: emptyModule,
        tls: emptyModule,
        worker_threads: emptyModule,
      }
    }
    return config
  },

  // Turbopack: stub Node.js built-ins for client/SSR bundles
  // @grpc/grpc-js (via @sip-protocol/sdk → @triton-one/yellowstone-grpc)
  // requires dns, fs, http2, net, tls which don't exist in browsers
  turbopack: {
    resolveAlias: {
      // Alias Node.js-only packages to empty stubs
      // Note: can't alias @grpc/grpc-js or @triton-one/yellowstone-grpc
      // because @sip-protocol/sdk needs real exports (CommitmentLevel, etc.)
      // Stub Node.js built-ins
      dns: { browser: "./src/lib/empty-module.ts" },
      fs: { browser: "./src/lib/empty-module.ts" },
      "fs/promises": { browser: "./src/lib/empty-module.ts" },
      http2: { browser: "./src/lib/empty-module.ts" },
      net: { browser: "./src/lib/empty-module.ts" },
      tls: { browser: "./src/lib/empty-module.ts" },
      worker_threads: { browser: "./src/lib/empty-module.ts" },
    },
  },

  // Experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@phosphor-icons/react",
      "@sip-protocol/react",
    ],
  },
}

export default nextConfig
