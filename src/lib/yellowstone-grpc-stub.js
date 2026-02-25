// Minimal browser stub for @triton-one/yellowstone-grpc.
//
// The real package loads WASM eagerly on import (via fs.readFileSync),
// which crashes in browser bundles. The client never makes gRPC calls —
// it only needs the CommitmentLevel enum and type definitions.
//
// This stub provides the enum values so the SDK works in client bundles
// without pulling in WASM, gRPC, or Node.js built-ins.

/* eslint-disable @typescript-eslint/no-explicit-any */

// CommitmentLevel enum (from geyser.proto)
var CommitmentLevel;
(function (CommitmentLevel) {
  CommitmentLevel[CommitmentLevel["PROCESSED"] = 0] = "PROCESSED";
  CommitmentLevel[CommitmentLevel["CONFIRMED"] = 1] = "CONFIRMED";
  CommitmentLevel[CommitmentLevel["FINALIZED"] = 2] = "FINALIZED";
  CommitmentLevel[CommitmentLevel["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(CommitmentLevel || (CommitmentLevel = {}));

// No-op client class (never used in browser)
function Client() {}
Client.prototype.subscribe = function () { return null; };

// Export everything the SDK might reference
module.exports.CommitmentLevel = CommitmentLevel;
module.exports.Client = Client;
module.exports.default = Client;

// Proxy for any other imports (SubscribeRequest, SubscribeUpdate, etc.)
var noop = function () {};
module.exports = new Proxy(module.exports, {
  get: function (target, prop) {
    if (typeof prop === "string" && prop in target) return target[prop];
    if (prop === "__esModule") return true;
    if (typeof prop === "symbol") return undefined;
    return noop;
  },
});
