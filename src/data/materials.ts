// Transparent price table. Each material lists the raw quotes we found
// (₦ per kg, small household quantities) with the source id. The app derives:
//   low     = lowest quote
//   high    = highest quote
//   typical = median of the quotes' mid-points
// so anyone can audit how an estimate was produced. All figures are ESTIMATES:
// real buyers weigh, inspect and may deduct for bags, dirt or oil stains.

export type BinId = 'plastic' | 'metal' | 'paper' | 'ewaste' | 'glass' | 'general'

export interface Quote {
  sourceId: string
  low: number
  high: number
  note?: string
}

export interface Material {
  id: string
  short: string
  name: string
  examples: string
  bin: BinId
  emoji: string
  quotes: Quote[]
  /** EPA WARM v16 net factors, MTCO2E per short ton */
  warm: { recycle: number; landfill: number; proxy?: string }
  /** grams per item, only where a source gives one */
  itemGrams?: { grams: number; label: string; sourceId: string }
  prep: string[]
  cashNote?: string
}

export const BINS: Record<BinId, { label: string; colour: string; text: string; hint: string }> = {
  plastic: { label: 'Plastics bag', colour: 'bg-sky-600', text: 'text-sky-800', hint: 'Bottles, hard plastics, sachets (keep sachets separate)' },
  metal: { label: 'Metals bag', colour: 'bg-amber-500', text: 'text-amber-800', hint: 'Cans, iron, aluminium, copper, brass (sort by metal)' },
  paper: { label: 'Paper & carton', colour: 'bg-orange-800', text: 'text-orange-900', hint: 'Flattened cartons, office paper. Keep dry.' },
  ewaste: { label: 'E-waste box', colour: 'bg-rose-600', text: 'text-rose-800', hint: 'Phones, chargers, cables, small appliances. Never burn.' },
  glass: { label: 'Glass crate', colour: 'bg-emerald-600', text: 'text-emerald-800', hint: 'Bottles and jars, whole if possible' },
  general: { label: 'General waste', colour: 'bg-stone-700', text: 'text-stone-800', hint: 'Not recyclable for cash. Bag it for your PSP / LAWMA / RIWAMA truck.' },
}

export const MATERIALS: Material[] = [
  {
    id: 'pet_clear',
    short: 'Clear PET',
    name: 'PET bottles (clear / blue)',
    examples: 'Water, soft-drink and juice bottles',
    bin: 'plastic',
    emoji: '🧴',
    quotes: [
      { sourceId: 'westman', low: 200, high: 200, note: 'PET bottles, Lekki' },
      { sourceId: 'nairametrics-2026', low: 250, high: 250, note: 'colourless PET, Ojo Lagos' },
      { sourceId: 'ecobarter', low: 120, high: 120, note: 'plastic bottles, Abuja' },
      { sourceId: 'fifthseed', low: 280, high: 300, note: 'no oil stain, 1–300 kg, Port Harcourt (₦280 if they pick up)' },
    ],
    warm: { recycle: -1.04, landfill: 0.02 },
    itemGrams: { grams: 20, label: 'bottle', sourceId: 'ecobarter' },
    prep: ['Empty and drain', 'Keep clear bottles apart from green/brown ones', 'No oil-stained bottles: buyers pay less than half for them', 'Squash to save space'],
  },
  {
    id: 'pet_coloured',
    short: 'Coloured PET',
    name: 'PET bottles (green / brown)',
    examples: 'Green and brown drink bottles',
    bin: 'plastic',
    emoji: '🍾',
    quotes: [
      { sourceId: 'fifthseed', low: 50, high: 80, note: 'grey ₦50, brown ₦70, green ₦80, Port Harcourt' },
      { sourceId: 'nairametrics-2026', low: 200, high: 200, note: 'coloured PET, Ojo Lagos' },
    ],
    warm: { recycle: -1.04, landfill: 0.02 },
    itemGrams: { grams: 20, label: 'bottle', sourceId: 'ecobarter' },
    prep: ['Sort by colour', 'Empty and drain'],
  },
  {
    id: 'hard_plastic',
    short: 'Hard plastic',
    name: 'Hard plastics (HDPE / PP)',
    examples: 'Buckets, chairs, bowls, jerrycans, bottle caps',
    bin: 'plastic',
    emoji: '🧺',
    quotes: [
      { sourceId: 'westman', low: 120, high: 120 },
      { sourceId: 'fifthseed', low: 280, high: 280, note: 'blow/injection plastic and bottle caps' },
    ],
    warm: { recycle: -0.76, landfill: 0.02, proxy: 'HDPE' },
    prep: ['Rinse out food and oil', 'Remove metal handles'],
  },
  {
    id: 'sachet',
    short: 'Sachets/nylon',
    name: 'Pure-water sachets & nylon',
    examples: 'Water sachets, nylon bags, shrink wrap',
    bin: 'plastic',
    emoji: '💧',
    quotes: [
      { sourceId: 'westman', low: 60, high: 60, note: 'nylon / plastic bags' },
      { sourceId: 'fifthseed', low: 40, high: 40, note: 'water sachet nylon (shrink wrap ₦160)' },
    ],
    warm: { recycle: -0.93, landfill: 0.02, proxy: 'Mixed Plastics (WARM has no LDPE recycling factor)' },
    prep: ['Shake out water and dry', 'Bundle in one bag, it is light so it adds up slowly'],
  },
  {
    id: 'carton',
    short: 'Carton',
    name: 'Cartons / cardboard',
    examples: 'Delivery boxes, packaging cartons',
    bin: 'paper',
    emoji: '📦',
    quotes: [
      { sourceId: 'westman', low: 70, high: 70 },
      { sourceId: 'fifthseed', low: 80, high: 80 },
      { sourceId: 'jhonks', low: 200, high: 200 },
      { sourceId: 'nairametrics-2026', low: 100, high: 100, note: 'what a carton collector pays shops in Orile' },
    ],
    warm: { recycle: -3.14, landfill: 0.18, proxy: 'Corrugated Containers' },
    prep: ['Flatten', 'Keep dry: wet carton is rejected or weighed down'],
  },
  {
    id: 'paper',
    short: 'Paper',
    name: 'Office / white paper',
    examples: 'Printouts, exercise books, newspapers',
    bin: 'paper',
    emoji: '📄',
    quotes: [
      { sourceId: 'westman', low: 60, high: 60 },
      { sourceId: 'fifthseed', low: 60, high: 60, note: 'white paper' },
    ],
    warm: { recycle: -3.55, landfill: 0.07, proxy: 'Mixed Paper (general)' },
    prep: ['Remove plastic covers', 'Keep dry'],
  },
  {
    id: 'al_cans',
    short: 'Cans',
    name: 'Aluminium drink cans',
    examples: 'Malt, soft-drink and beer cans',
    bin: 'metal',
    emoji: '🥫',
    quotes: [
      { sourceId: 'westman', low: 500, high: 500 },
      { sourceId: 'ecobarter', low: 360, high: 360 },
      { sourceId: 'jhonks', low: 1000, high: 1000, note: '"aluminium"' },
      { sourceId: 'fifthseed', low: 1800, high: 1800, note: 'used beverage cans, 1–300 kg, Port Harcourt' },
    ],
    warm: { recycle: -9.13, landfill: 0.02 },
    itemGrams: { grams: 20, label: 'can', sourceId: 'ecobarter' },
    prep: ['Empty', 'Crush flat', 'Keep separate from iron tins (check with a magnet: aluminium does not stick)'],
    cashNote: 'Prices vary widely between buyers. Ask two collectors before you sell.',
  },
  {
    id: 'al_scrap',
    short: 'Aluminium scrap',
    name: 'Aluminium scrap',
    examples: 'Old pots, window/door profiles, roofing sheets',
    bin: 'metal',
    emoji: '🍳',
    quotes: [
      { sourceId: 'vmartins', low: 1800, high: 2500, note: 'cast ₦1,800–₦2,200; profile & roofing ₦2,000–₦2,500' },
      { sourceId: 'technext', low: 2000, high: 2000 },
      { sourceId: 'fifthseed', low: 1550, high: 2300, note: 'cast ₦1,550, thick ₦1,700, soft ₦2,300' },
      { sourceId: 'jhonks', low: 1000, high: 1000 },
    ],
    warm: { recycle: -7.2, landfill: 0.02, proxy: 'Aluminum Ingot' },
    prep: ['Remove steel bolts, plastic handles and rubber', 'Magnet test: it should not stick'],
  },
  {
    id: 'iron',
    short: 'Iron/tin',
    name: 'Iron / steel / tin ("condemn")',
    examples: 'Iron rods, old tins, bed frames, zinc offcuts',
    bin: 'metal',
    emoji: '🔩',
    quotes: [
      { sourceId: 'westman', low: 300, high: 300, note: 'iron / tin' },
      { sourceId: 'ecobarter', low: 200, high: 200, note: 'metals' },
      { sourceId: 'vmartins', low: 400, high: 500 },
      { sourceId: 'technext', low: 700, high: 800, note: 'what big-market merchants pay' },
      { sourceId: 'fifthseed', low: 430, high: 480, note: 'light iron/tin ₦430, thick iron ₦480' },
      { sourceId: 'jhonks', low: 500, high: 500, note: '"metal"' },
    ],
    warm: { recycle: -1.83, landfill: 0.02, proxy: 'Steel Cans' },
    prep: ['Thick iron pays more than light tin', 'Never take rails, manhole covers or public property: buyers and police check'],
  },
  {
    id: 'copper_insulated',
    short: 'Copper cable',
    name: 'Copper cable (insulated)',
    examples: 'Old house wiring, extension cables',
    bin: 'metal',
    emoji: '🔌',
    quotes: [{ sourceId: 'vmartins', low: 2500, high: 3000 }],
    warm: { recycle: -4.49, landfill: 0.02, proxy: 'Copper Wire' },
    prep: ['Do NOT burn off the insulation: toxic smoke. Strip by hand or sell as-is.'],
  },
  {
    id: 'copper_bare',
    short: 'Bare copper',
    name: 'Copper (bare / stripped)',
    examples: 'Stripped wire, copper pipes',
    bin: 'metal',
    emoji: '🔶',
    quotes: [
      { sourceId: 'vmartins', low: 12000, high: 14000 },
      { sourceId: 'technext', low: 14000, high: 15500 },
      { sourceId: 'jhonks', low: 8000, high: 8000, note: '"copper wires"' },
    ],
    warm: { recycle: -4.49, landfill: 0.02, proxy: 'Copper Wire' },
    prep: ['Keep clean and dry', 'Weigh before you go, so you know what to expect'],
  },
  {
    id: 'brass',
    short: 'Brass',
    name: 'Brass',
    examples: 'Old taps, valves, fittings',
    bin: 'metal',
    emoji: '🚰',
    quotes: [
      { sourceId: 'vmartins', low: 7500, high: 8000 },
      { sourceId: 'technext', low: 8000, high: 8000 },
      { sourceId: 'jhonks', low: 2000, high: 2000 },
    ],
    warm: { recycle: -4.39, landfill: 0.02, proxy: 'Mixed Metals' },
    prep: ['Remove iron parts and attachments for the best price'],
  },
  {
    id: 'ewaste',
    short: 'E-waste',
    name: 'E-waste',
    examples: 'Dead phones, chargers, radios, fans, keyboards',
    bin: 'ewaste',
    emoji: '📱',
    quotes: [],
    warm: { recycle: -0.9, landfill: 0.02, proxy: 'Mixed Electronics' },
    prep: ['Take to an EPRON-listed collection centre', 'Tape over swollen batteries; never burn or break them open'],
    cashNote: 'No reliable per-kg price: collectors quote after inspection. Copper inside (cables) is worth the most.',
  },
  {
    id: 'glass',
    short: 'Glass',
    name: 'Glass bottles & jars',
    examples: 'Drink bottles, jam and medicine jars',
    bin: 'glass',
    emoji: '🍶',
    quotes: [],
    warm: { recycle: -0.28, landfill: 0.02 },
    prep: ['Keep whole', 'Rinse'],
    cashNote: 'Accepted by Wecyclers and Chanja Datti, usually for points rather than cash. We found no reliable naira price.',
  },
]

export const SHORT_TON_TO_KG_FACTOR = 1.102311 // 1 MTCO2E/short ton = 1.102311 kg CO2e per kg

export function co2SavedPerKg(m: Material): number {
  return (m.warm.landfill - m.warm.recycle) * SHORT_TON_TO_KG_FACTOR
}

export const materialById = (id: string) => MATERIALS.find((m) => m.id === id)
