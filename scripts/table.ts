// Prints the price & carbon table as Markdown (used in README). Run: npx vite-node scripts/table.ts
import { MATERIALS, co2SavedPerKg } from '../src/data/materials'
import { priceBand } from '../src/lib/estimate'
const n = (x: number) => '₦' + x.toLocaleString('en-NG')
console.log('| Material | ₦/kg low–high | Typical (median) | Quotes | kg CO₂e saved per kg | WARM factor used |')
console.log('|---|---|---|---|---|---|')
for (const m of MATERIALS) {
  const b = priceBand(m)
  console.log(`| ${m.name} | ${b.hasPrice ? `${n(b.low)}–${n(b.high)}` : 'quote on inspection'} | ${b.hasPrice ? n(b.typical) : '–'} | ${m.quotes.map((q) => q.sourceId).join(', ') || '–'} | ${co2SavedPerKg(m).toFixed(2)} | ${m.warm.proxy ?? ({ pet_clear: 'PET', pet_coloured: 'PET', al_cans: 'Aluminum Cans', glass: 'Glass' } as Record<string, string>)[m.id]} (recycle ${m.warm.recycle}, landfill ${m.warm.landfill}) |`)
}
