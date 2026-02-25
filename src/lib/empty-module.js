// Stub for Node.js built-ins that don't exist in browser/edge environments.
// Used by webpack resolve.fallback to satisfy imports from @grpc/grpc-js
// and @triton-one/yellowstone-grpc in client bundles.
//
// .js extension ensures webpack can load this without a TypeScript loader.
// Handles: http2.constants destructuring, util.promisify(dns.lookup), etc.

/* eslint-disable @typescript-eslint/no-explicit-any */
const noop = function () {};

// dns stubs (util.promisify needs real functions)
module.exports.lookup = noop;
module.exports.resolve = noop;
module.exports.resolve4 = noop;
module.exports.resolve6 = noop;

// http2 stubs (constants destructuring)
module.exports.constants = {};
module.exports.createServer = noop;
module.exports.createSecureServer = noop;
module.exports.connect = noop;

// fs stubs
module.exports.readFileSync = noop;
module.exports.readFile = noop;
module.exports.existsSync = function () { return false; };
module.exports.statSync = noop;
module.exports.promises = {};

// net/tls stubs
module.exports.createConnection = noop;
module.exports.Socket = noop;
module.exports.isIP = function () { return 0; };

// Default export — proxy for any uncovered property access
module.exports.default = new Proxy(module.exports, {
  get: function (target, prop) {
    if (typeof prop === "string" && prop in target) return target[prop];
    if (prop === "__esModule") return true;
    if (typeof prop === "symbol") return undefined;
    return noop;
  },
});
