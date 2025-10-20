// Polyfill for MutationObserver on server-side (Next.js DevTools workaround)
// Next.js DevTools tries to use MutationObserver during SSR, which doesn't exist in Node.js
// This provides a minimal no-op implementation to prevent crashes

if (typeof global !== 'undefined' && typeof global.MutationObserver === 'undefined') {
  global.MutationObserver = class MutationObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}
