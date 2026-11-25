// src/wallet/device.ts
// Small, so the site can ask it without loading the wallet code.

/** A phone or tablet browser: the wallet is an app there, not an extension. */
export const isPhone = (): boolean =>
  typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
