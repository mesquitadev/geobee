// leaflet.vectorgrid is an IIFE that accesses `L` from the global scope.
// In Vite/ESM, `import L from 'leaflet'` is module-scoped, so vectorgrid
// can't find it. We must set window.L BEFORE vectorgrid code executes.
//
// Static imports are hoisted, so we use dynamic import for vectorgrid.
import L from 'leaflet'

;(window as any).L = L

export async function initVectorGrid() {
  await import('leaflet.vectorgrid')
}

export default L
