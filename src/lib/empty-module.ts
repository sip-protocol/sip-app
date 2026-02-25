// Stub for Node.js built-ins that don't exist in browser/edge environments.
// Used by Turbopack resolveAlias to satisfy imports from @grpc/grpc-js
// and @triton-one/yellowstone-grpc in client bundles.
// Named exports satisfy CJS require() destructuring (e.g. http2.constants).
export const constants = {}
export const createServer = () => {}
export const createSecureServer = () => {}
export const connect = () => {}
const emptyModule = { constants, createServer, createSecureServer, connect }
export default emptyModule
