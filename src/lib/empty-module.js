// Stub for Node.js built-ins that don't exist in browser/edge environments.
// Used by webpack resolve.fallback to satisfy imports from @grpc/grpc-js
// and @triton-one/yellowstone-grpc in client bundles.
//
// .js extension ensures webpack can load this without a TypeScript loader.
//
// IMPORTANT: All stub functions must be regular functions (not arrow functions)
// so they can be used with `new` — gRPC code does `new net.Socket()`,
// `new dns.Resolver()`, `new tls.TLSSocket()`, etc.

/* eslint-disable @typescript-eslint/no-explicit-any */

// Constructor-safe no-op (regular function, works with `new`)
function noop() {}
noop.prototype = {};

// Build all known exports as an object first
var stubs = {
  // dns stubs (util.promisify needs real functions)
  lookup: noop,
  resolve: noop,
  resolve4: noop,
  resolve6: noop,
  Resolver: noop,

  // http2 stubs (constants destructuring)
  constants: {},
  createServer: noop,
  createSecureServer: noop,
  connect: noop,
  sensitiveHeaders: Symbol("sensitiveHeaders"),

  // fs stubs
  readFileSync: noop,
  readFile: noop,
  writeFile: noop,
  writeFileSync: noop,
  existsSync: function () { return false; },
  statSync: noop,
  readdirSync: function () { return []; },
  mkdirSync: noop,
  promises: {
    readFile: function () { return Promise.resolve(Buffer.alloc(0)); },
    writeFile: function () { return Promise.resolve(); },
    stat: function () { return Promise.resolve({}); },
    readdir: function () { return Promise.resolve([]); },
    mkdir: function () { return Promise.resolve(); },
  },

  // net stubs
  createConnection: noop,
  Socket: noop,
  Server: noop,
  isIP: function () { return 0; },
  isIPv4: function () { return false; },
  isIPv6: function () { return false; },

  // tls stubs
  TLSSocket: noop,
  SecureContext: noop,

  // worker_threads stubs
  Worker: noop,
  isMainThread: true,
  parentPort: null,
  workerData: null,

  // Mark as ES module for interop
  __esModule: true,
};

// Wrap in a Proxy so ANY property access returns a constructor-safe function.
// This catches uncommon properties that gRPC or other Node.js libs may access.
module.exports = new Proxy(stubs, {
  get: function (target, prop) {
    if (typeof prop === "string" && prop in target) return target[prop];
    if (prop === "__esModule") return true;
    if (prop === "default") return module.exports; // self-reference for ESM interop
    if (typeof prop === "symbol") return undefined;
    // Return constructor-safe noop for unknown properties
    return noop;
  },
});
