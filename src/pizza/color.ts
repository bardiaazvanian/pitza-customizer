/** Linear RGB color interpolation, used for the bake transformation. */
export type RGB = [number, number, number]

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

export function mixColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  const k = Math.min(1, Math.max(0, t))
  const r = Math.round(r1 + (r2 - r1) * k)
  const g = Math.round(g1 + (g2 - g1) * k)
  const bl = Math.round(b1 + (b2 - b1) * k)
  return `rgb(${r}, ${g}, ${bl})`
}
