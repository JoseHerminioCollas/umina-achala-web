// src/env.ts
// Vite's build-time settings, read only here so config.ts can be tested:
// Jest cannot parse import.meta, so its tests use __tests__/mocks/env.ts.
export const env: Partial<ImportMetaEnv> = import.meta.env;
