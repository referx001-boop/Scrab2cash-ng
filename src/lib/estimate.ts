import { MATERIALS, co2SavedPerKg, materialById, type Material } from '../data/materials'

export interface PriceBand {
  low: number
  typical: number
  high: number
  hasPrice: boolean
  quoteCount: number
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/** low = lowest quote, high = highest quote, typical = median of quote mid-points */
export function priceBand(m: Material): PriceBand {
  if (!m.quotes.length) return { low: 0, typical: 0, high: 0, hasPrice: false, quoteCount: 0 }
  const low = Math.min(...m.quotes.map((q) => q.low))
  const high = Math.max(...m.quotes.map((q) => q.high))
  const typical = Math.round(median(m.quotes.map((q) => (q.low + q.high) / 2)))
  return { low, typical, high, hasPrice: true, quoteCount: m.quotes.length }
}

export interface CartItem {
  materialId: string
  kg: number
}

export interface LineEstimate extends CartItem {
  material: Material
  band: PriceBand
  low: number
  typical: number
  high: number
  co2: number
}

export function estimateLine(item: CartItem): LineEstimate | null {
  const material = materialById(item.materialId)
  if (!material || !(item.kg > 0)) return null
  const band = priceBand(material)
  return {
    ...item,
    material,
    band,
    low: band.low * item.kg,
    typical: band.typical * item.kg,
    high: band.high * item.kg,
    co2: co2SavedPerKg(material) * item.kg,
  }
}

export function estimateCart(items: CartItem[]) {
  const lines = items.map(estimateLine).filter((l): l is LineEstimate => l !== null)
  const sum = (k: 'low' | 'typical' | 'high' | 'co2' | 'kg') => lines.reduce((a, l) => a + l[k], 0)
  return {
    lines,
    low: sum('low'),
    typical: sum('typical'),
    high: sum('high'),
    co2: sum('co2'),
    kg: sum('kg'),
    unpriced: lines.filter((l) => !l.band.hasPrice).map((l) => l.material.name),
  }
}

export const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG')
export const kgFmt = (n: number) => (n < 10 ? n.toFixed(1).replace(/\.0$/, '') : Math.round(n).toLocaleString('en-NG')) + ' kg'

export const ALL_MATERIALS = MATERIALS
