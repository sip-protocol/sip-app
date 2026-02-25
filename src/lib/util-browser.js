// Custom util wrapper for browser bundles.
//
// Problem: WASM-bindgen code (from @triton-one/yellowstone-grpc) does:
//   const { TextDecoder, TextEncoder } = require('util')
// But webpack's util polyfill (npm `util` package) doesn't export
// TextDecoder/TextEncoder — they're browser globals that Node.js
// re-exports from util but the polyfill omits.
//
// Solution: Load the original polyfill via relative path (bypasses alias),
// then add the browser globals.

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */

// Relative path to node_modules bypasses webpack's resolve.alias
var originalUtil = require("../../node_modules/util");

// Re-export everything from the original polyfill
var wrapper = Object.create(originalUtil);

// Add TextDecoder/TextEncoder from browser globals
wrapper.TextDecoder = typeof TextDecoder !== "undefined" ? TextDecoder : undefined;
wrapper.TextEncoder = typeof TextEncoder !== "undefined" ? TextEncoder : undefined;

module.exports = wrapper;
