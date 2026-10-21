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
// Next 15+ app-router hooks throw ("expected app router to be mounted") when no router
// is mounted, where Next 14 returned null. Page tests render outside a router, so stub
// the hooks; notFound()/redirect() keep their real (throwing) behaviour.
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  };
  return {
    ...actual,
    useRouter: () => router,
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    useSelectedLayoutSegment: () => null,
    useSelectedLayoutSegments: () => [],
  };
});
