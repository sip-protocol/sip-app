// Stub for Node.js built-ins that don't exist in browser/edge environments.
// Used by Turbopack resolveAlias to satisfy imports from @grpc/grpc-js,
// @triton-one/yellowstone-grpc, etc. in client bundles.
//
// IMPORTANT: All stub functions must be regular functions (not arrow functions)
// so they can be used with `new` — gRPC code does `new net.Socket()`,
// `new dns.Resolver()`, `new tls.TLSSocket()`, etc.

/* eslint-disable @typescript-eslint/no-explicit-any */

// Constructor-safe no-op (regular function, works with `new`)
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = function noop() {} as any
noop.prototype = {}

// dns module stubs
export const lookup = noop
export const resolve = noop
export const resolve4 = noop
export const resolve6 = noop
export const Resolver = noop

// http2 module stubs
export const constants = {} as Record<string, any>
export const createServer = noop
export const createSecureServer = noop
export const connect = noop
export const sensitiveHeaders = Symbol("sensitiveHeaders")

// fs module stubs
export const readFileSync = noop
export const readFile = noop
export const writeFile = noop
export const writeFileSync = noop
export const existsSync = function existsSync() { return false }
export const statSync = noop
export const readdirSync = function readdirSync() { return [] }
export const mkdirSync = noop
export const promises = {
  readFile: function readFile() { return Promise.resolve(Buffer.alloc(0)) },
  writeFile: function writeFile() { return Promise.resolve() },
  stat: function stat() { return Promise.resolve({}) },
  readdir: function readdir() { return Promise.resolve([]) },
  mkdir: function mkdir() { return Promise.resolve() },
}

// net module stubs
export const createConnection = noop
export const Socket = noop
export const Server = noop
export const isIP = function isIP() { return 0 }
export const isIPv4 = function isIPv4() { return false }
export const isIPv6 = function isIPv6() { return false }

// tls module stubs
export const TLSSocket = noop
export const SecureContext = noop

// worker_threads stubs
export const Worker = noop
export const isMainThread = true
export const parentPort = null
export const workerData = null

// Proxy-based default export — catches any property not explicitly exported.
const base: Record<string, any> = {
  lookup, resolve, resolve4, resolve6, Resolver,
  constants, createServer, createSecureServer, connect, sensitiveHeaders,
  readFileSync, readFile, writeFile, writeFileSync, existsSync, statSync,
  readdirSync, mkdirSync, promises,
  createConnection, Socket, Server, isIP, isIPv4, isIPv6,
  TLSSocket, SecureContext,
  Worker, isMainThread, parentPort, workerData,
}

const handler: ProxyHandler<Record<string, any>> = {
  get(target, prop) {
    if (typeof prop === "string" && prop in target) return target[prop]
    if (prop === "__esModule") return true
    if (prop === "default") return proxy
    if (typeof prop === "symbol") return undefined
    // Return constructor-safe noop for unknown properties
    return noop
  },
}

const proxy = new Proxy(base, handler)
export default proxy
