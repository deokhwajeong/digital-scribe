/**
 * Demo mode is the static GitHub Pages build (NEXT_PUBLIC_DEMO=1).
 * Everything still runs in the browser; the flag only swaps in bundled
 * samples where a live service would otherwise be needed.
 */
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === '1';
