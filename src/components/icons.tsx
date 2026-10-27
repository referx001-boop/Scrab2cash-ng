// One consistent inline-SVG icon set (24px grid, 1.8 stroke, round caps).
// Shapes are drawn in the style of Lucide (ISC). No icon font, no network.
import type { BinId } from '../data/materials'

const P: Record<string, string> = {
  scale:
    '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  pin: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  truck:
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  phone:
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  whatsapp: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2Z"/>',
  directions: '<path d="M3 11 22 2l-9 19-2-8Z"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  locate: '<path d="M2 12h3"/><path d="M19 12h3"/><path d="M12 2v3"/><path d="M12 19v3"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  offline:
    '<path d="M12 20h.01"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/><path d="M5 12.86a10 10 0 0 1 5.17-2.69"/><path d="M19 12.86a10 10 0 0 0-2-1.52"/><path d="M2 8.82a15 15 0 0 1 4.18-2.64"/><path d="M22 8.82a15 15 0 0 0-11.29-3.76"/><path d="m2 2 20 20"/>',
  recycle:
    '<path d="M7 19H4.82a1.83 1.83 0 0 1-1.57-.88 1.79 1.79 0 0 1 0-1.78L7.2 9.5"/><path d="M11 19h8.2a1.83 1.83 0 0 0 1.56-.89 1.78 1.78 0 0 0 0-1.78l-1.23-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.29 13.6 7.2 9.5 3.1 10.6"/><path d="m9.34 5.81 1.1-1.89A1.83 1.83 0 0 1 11.98 3a1.78 1.78 0 0 1 1.55.89l3.94 6.84"/><path d="m13.38 9.63 4.1 1.1 1.09-4.1"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h8"/><path d="M7 11h12"/><path d="M7 6h3"/>',
  // material illustrations
  bottle: '<path d="M10 2h4"/><path d="M10.5 2v3.2L8.4 8.3A3 3 0 0 0 8 9.8V20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V9.8a3 3 0 0 0-.4-1.5l-2.1-3.1V2"/><path d="M8 13h8"/><path d="M8 17h8"/>',
  bucket: '<path d="M4 8h16l-1.6 11.3A2 2 0 0 1 16.4 21H7.6a2 2 0 0 1-2-1.7Z"/><path d="M6 8a6 6 0 0 1 12 0"/><path d="M6.5 12h11"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  box: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="m7.5 4.27 9 5.15"/>',
  paper: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M8 9h2"/>',
  can: '<ellipse cx="12" cy="5" rx="6" ry="2"/><path d="M6 5v14c0 1.1 2.7 2 6 2s6-.9 6-2V5"/><path d="M6 9.5c0 1.1 2.7 2 6 2s6-.9 6-2"/>',
  pot: '<path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  coil: '<path d="M4 20c4 0 4-4 8-4s4 4 8 4"/><path d="M4 14c4 0 4-4 8-4s4 4 8 4"/><path d="M4 8c4 0 4-4 8-4s4 4 8 4"/>',
  tap: '<path d="M3 9h9a4 4 0 0 1 4 4v1"/><path d="M3 6v6"/><path d="M8 9V5"/><path d="M5.5 4.5h5"/><path d="M14 14h4"/><path d="M16 18v.01"/><path d="M16 21.5v.01"/>',
  phoneDevice: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  jar: '<path d="M10 2h4v3.5c0 .9 2 2 2 5V20a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-9.5c0-3 2-4.1 2-5Z"/><path d="M8 14h8"/>',
}

export type IconName = keyof typeof P

export function Icon({ name, size = 20, className = '', strokeWidth = 1.8, title }: { name: IconName; size?: number; className?: string; strokeWidth?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: P[name] }}
    />
  )
}

const MATERIAL_ICON: Record<string, IconName> = {
  pet_clear: 'bottle',
  pet_coloured: 'bottle',
  hard_plastic: 'bucket',
  sachet: 'droplet',
  carton: 'box',
  paper: 'paper',
  al_cans: 'can',
  al_scrap: 'pot',
  iron: 'wrench',
  copper_insulated: 'plug',
  copper_bare: 'coil',
  brass: 'tap',
  ewaste: 'phoneDevice',
  glass: 'jar',
}

/** Soft, accessible tones per sorting bin (text ≥ 4.5:1 on its tint). */
export const BIN_TONE: Record<BinId, { tile: string; badge: string; bar: string; dot: string }> = {
  plastic: { tile: 'bg-sky-50 text-sky-700 ring-sky-100', badge: 'bg-sky-50 text-sky-800 ring-sky-200', bar: 'bg-sky-500', dot: 'bg-sky-500' },
  metal: { tile: 'bg-amber-50 text-amber-700 ring-amber-100', badge: 'bg-amber-50 text-amber-900 ring-amber-200', bar: 'bg-amber-500', dot: 'bg-amber-500' },
  paper: { tile: 'bg-orange-50 text-orange-800 ring-orange-100', badge: 'bg-orange-50 text-orange-900 ring-orange-200', bar: 'bg-orange-700', dot: 'bg-orange-700' },
  ewaste: { tile: 'bg-rose-50 text-rose-700 ring-rose-100', badge: 'bg-rose-50 text-rose-800 ring-rose-200', bar: 'bg-rose-500', dot: 'bg-rose-500' },
  glass: { tile: 'bg-emerald-50 text-emerald-700 ring-emerald-100', badge: 'bg-emerald-50 text-emerald-800 ring-emerald-200', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  general: { tile: 'bg-stone-100 text-stone-700 ring-stone-200', badge: 'bg-stone-100 text-stone-800 ring-stone-300', bar: 'bg-stone-500', dot: 'bg-stone-500' },
}

export function MaterialIcon({ id, bin, size = 'md' }: { id?: string; bin: BinId; size?: 'sm' | 'md' | 'lg' }) {
  const box = { sm: 'h-8 w-8 rounded-lg', md: 'h-10 w-10 rounded-xl', lg: 'h-14 w-14 rounded-2xl' }[size]
  const px = { sm: 16, md: 20, lg: 28 }[size]
  const name: IconName = (id && MATERIAL_ICON[id]) || (bin === 'general' ? 'trash' : 'recycle')
  return (
    <span aria-hidden className={`inline-flex shrink-0 items-center justify-center ring-1 ring-inset ${box} ${BIN_TONE[bin].tile}`}>
      <Icon name={name} size={px} />
    </span>
  )
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false" className="shrink-0">
      <defs>
        <linearGradient id="s2c-lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#15794e" />
          <stop offset="1" stopColor="#0c402c" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#s2c-lg)" />
      <path d="M15.5 27A17 17 0 0 1 45 19" fill="none" stroke="#b0e4c7" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M47.5 13.5 46.5 22l-8.3-1.6z" fill="#b0e4c7" />
      <path d="M48.5 37A17 17 0 0 1 19 45" fill="none" stroke="#f2b93b" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M16.5 50.5 17.5 42l8.3 1.6z" fill="#f2b93b" />
      <text x="32" y="40.5" fontFamily="Arial,Helvetica,sans-serif" fontSize="21" fontWeight="700" fill="#fff" textAnchor="middle">
        ₦
      </text>
    </svg>
  )
}
