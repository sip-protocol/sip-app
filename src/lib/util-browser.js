// Custom util wrapper for browser bundles.
//
// Problem: WASM-bindgen code (from @triton-one/yellowstone-grpc) does:
//   const { TextDecoder, TextEncoder } = require('util')
// But webpack's util polyfill (npm `util` package) doesn't export
// TextDecoder/TextEncoder — they're browser globals that Node.js
// re-exports from util but the polyfill omits.
//
// Solution: Load the original polyfill via "__original_util__" alias
// (configured in next.config.ts), then add browser globals.

/* eslint-disable @typescript-eslint/no-require-imports */
var originalUtil = require("__original_util__");

var wrapper = Object.create(originalUtil);
wrapper.TextDecoder = typeof TextDecoder !== "undefined" ? TextDecoder : undefined;
wrapper.TextEncoder = typeof TextEncoder !== "undefined" ? TextEncoder : undefined;

module.exports = wrapper;
