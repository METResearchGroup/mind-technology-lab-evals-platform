/**
 * Jest Polyfills
 * These polyfills are loaded BEFORE any tests run
 */

const { TextDecoder, TextEncoder } = require('util');

Object.assign(global, { TextDecoder, TextEncoder });
