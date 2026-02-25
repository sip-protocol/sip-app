import type { NextConfig } from "next"
import path from "path"

// Stub module that provides empty named exports (e.g. constants: {})
// so that destructuring from Node.js built-ins doesn't throw at runtime.
const emptyModule = path.resolve(process.cwd(), "src/lib/empty-module.ts")

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

  // Stub Node.js built-ins for client bundles (webpack)
  // @grpc/grpc-js requires dns, fs, http2, net, tls which don't exist in browsers
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        fs: false,
        "fs/promises": false,
        http2: emptyModule,
        net: false,
        tls: false,
        worker_threads: false,
      }
    }
    return config
  },

  // Turbopack: stub Node.js built-ins for client/SSR bundles
  // @grpc/grpc-js (via @sip-protocol/sdk → @triton-one/yellowstone-grpc)
  // requires dns, fs, http2, net, tls which don't exist in browsers
  turbopack: {
    resolveAlias: {
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
