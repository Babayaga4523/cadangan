// Compatibility shim: re-export the canonical `useAuthStore` from `auth.ts`.
// This file exists so imports that resolve to `./stores/auth` (and prefer
// the .tsx extension) still receive the authoritative implementation.
export { useAuthStore } from './auth';