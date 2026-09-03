import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';
Error.stackTraceLimit = 10;
Object.defineProperty(global, 'TextDecoder', {
  value: TextDecoder,
});

Object.defineProperty(global, 'TextEncoder', {
  value: TextEncoder,
});

// jsdom lacks ResizeObserver, which Radix UI primitives (Checkbox, Select, …) touch on mount.
if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}