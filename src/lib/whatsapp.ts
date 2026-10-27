import type { Collector } from '../data/collectors'
import { estimateCart, naira, kgFmt, type CartItem } from './estimate'

/** Normalise a Nigerian number (0803..., +234803..., 234803...) to wa.me digits */
export function toWaDigits(phone: string): string | null {
  const d = phone.replace(/\D/g, '')
  if (/^234\d{10}$/.test(d)) return d
  if (/^0\d{10}$/.test(d)) return '234' + d.slice(1)
  if (/^\d{10}$/.test(d)) return '234' + d
  return null
}

export interface PickupDetails {
  name: string
  area: string
  landmark: string
  when: string
}

export function pickupMessage(c: Collector, items: CartItem[], d: PickupDetails): string {
  const est = estimateCart(items)
  const lines = est.lines.map((l) => `• ${l.material.name}: about ${kgFmt(l.kg)}`)
  const value = est.typical > 0 ? `\nMy rough estimate: ${naira(est.low)}–${naira(est.high)} (I know you will weigh and confirm the price).` : ''
  return [
    `Hello ${c.name.split(':')[0].trim()}, I found you on Scrap2Cash NG.`,
    `I have sorted recyclables ready for ${c.kind === 'dropoff' ? 'drop-off' : 'pickup'}:`,
    ...lines,
    `Total: about ${kgFmt(est.kg)}.${value}`,
    '',
    `Name: ${d.name || '-'}`,
    `Area: ${d.area || '-'}${d.landmark ? ` (landmark: ${d.landmark})` : ''}`,
    `Best time: ${d.when || 'any time'}`,
    '',
    'Please confirm your price per kg and when you can come. Thank you!',
  ].join('\n')
}

export function waLink(digits: string, text: string) {
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
