// Stub for Node.js built-ins that don't exist in browser/edge environments.
// Used by webpack resolve.fallback and Turbopack resolveAlias to satisfy
// imports from @grpc/grpc-js, @triton-one/yellowstone-grpc, etc.
//
// Must handle:
// - http2.constants destructuring (gRPC)
// - util.promisify(dns.lookup) — needs a real function
// - fs.readFileSync, net.connect, tls.connect — needs functions
// - Any other property access should return a no-op function

/* eslint-disable @typescript-eslint/no-explicit-any */
const noop = (() => {}) as (...args: any[]) => any

// Provide common named exports as no-op functions
export const constants = {} as Record<string, any>
export const createServer = noop
export const createSecureServer = noop
export const connect = noop

// dns module stubs (util.promisify(dns.lookup) needs a function)
export const lookup = noop
export const resolve = noop
export const resolve4 = noop
export const resolve6 = noop

// fs module stubs
export const readFileSync = noop
export const readFile = noop
export const existsSync = () => false
export const statSync = noop

// net/tls stubs
export const createConnection = noop
export const Socket = noop
export const isIP = () => 0

// Use a Proxy as default export so any property access returns a no-op.
// This catches uncommon properties we haven't explicitly exported.
const handler: ProxyHandler<Record<string, any>> = {
  get(target, prop) {
    if (typeof prop === "string" && prop in target) return target[prop]
    if (prop === "__esModule") return true
    if (prop === "default") return proxy
    if (typeof prop === "symbol") return undefined
    // Return a no-op function for unknown properties
    return noop
  },
}

const base: Record<string, any> = {
  constants,
  createServer,
  createSecureServer,
  connect,
  lookup,
  resolve,
  resolve4,
  resolve6,
  readFileSync,
  readFile,
  existsSync,
  statSync,
  createConnection,
  Socket,
  isIP,
}

const proxy = new Proxy(base, handler)
export default proxy
