import type { NextConfig } from "next"
import path from "path"

// Stub module for webpack resolve.fallback — provides no-op functions
// so destructuring and util.promisify() calls don't throw at runtime.
// Uses .js extension so webpack can load it without TypeScript loader.
const emptyModule = path.resolve(process.cwd(), "src/lib/empty-module.js")
const utilBrowser = path.resolve(process.cwd(), "src/lib/util-browser.js")

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

  // Stub Node.js-only packages for CLIENT bundles (webpack).
  // The SDK barrel exports QuickNodeProvider/TritonProvider which pull in
  // @triton-one/yellowstone-grpc → @grpc/grpc-js → dns/fs/http2/net/tls.
  // The client never uses gRPC at runtime, so alias it entirely to stubs.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Eliminate gRPC stack from client bundle entirely — the client
        // never makes gRPC calls, these are only pulled in transitively
        // via SDK barrel exports (QuickNode/Triton providers)
        "@grpc/grpc-js": emptyModule,
        "@grpc/proto-loader": emptyModule,
        // fs/promises must use alias (not fallback) — webpack quirk with
        // slash-separated paths in fallback context
        "fs/promises": emptyModule,
        // WASM-bindgen (yellowstone-grpc) does `const { TextDecoder } = require('util')`
        // but webpack's util polyfill doesn't export TextDecoder/TextEncoder.
        // Exact match (util$) avoids intercepting `util/xxx` sub-imports.
        "util$": utilBrowser,
      }
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: emptyModule,
        fs: emptyModule,
        http2: emptyModule,
        net: emptyModule,
        tls: emptyModule,
        worker_threads: emptyModule,
      }
    }
    return config
  },

  // Turbopack: stub Node.js built-ins for client/SSR bundles.
  // Note: can't alias @grpc/grpc-js here — Turbopack does strict ESM static
  // export checking which fails on generic stubs. gRPC aliases are webpack-only
  // (production). Turbopack handles it via the Node.js built-in stubs below.
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
