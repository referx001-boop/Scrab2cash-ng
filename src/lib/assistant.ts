// "What bin / what value?" assistant. 100% rules-based and offline: no API keys,
// no network. It matches keywords (English, Nigerian Pidgin and common market
// terms) to a material, parses an optional quantity, and returns the bin, prep
// tips and a price band from the transparent table.

import { BINS, materialById, type BinId, type Material } from '../data/materials'
import { priceBand, naira } from './estimate'

interface Rule {
  materialId?: string
  bin: BinId
  keywords: string[]
  /** skip this rule if any of these words appear */
  exclude?: string[]
  /** for non-recyclables / hazards */
  label?: string
  advice?: string
}

const RULES: Rule[] = [
  // order matters: more specific first
  { materialId: 'pet_coloured', bin: 'plastic', keywords: ['green bottle', 'brown bottle', 'coloured bottle', 'colored bottle', 'green plastic', 'sprite bottle', '7up bottle'] },
  { materialId: 'sachet', bin: 'plastic', keywords: ['sachet', 'pure water', 'pure-water', 'nylon', 'shrink wrap', 'shopping bag', 'polythene', 'leather bag', 'water bag'], exclude: ['bottle', 'bottles'] },
  { materialId: 'copper_insulated', bin: 'metal', keywords: ['cable', 'wiring', 'extension wire', 'insulated wire', 'electric wire'] },
  { materialId: 'copper_bare', bin: 'metal', keywords: ['copper', 'stripped wire', 'bare wire'] },
  { materialId: 'brass', bin: 'metal', keywords: ['brass', 'tap', 'valve', 'faucet'] },
  { materialId: 'ewaste', bin: 'ewaste', keywords: ['pressing iron', 'electric iron'] },
  { materialId: 'al_cans', bin: 'metal', keywords: ['cans', 'malt can', 'coke can', 'beer can', 'drink can', 'tin drink', 'beverage can', 'body spray can'] },
  { materialId: 'al_scrap', bin: 'metal', keywords: ['aluminium', 'aluminum', 'pot', 'pots', 'window frame', 'profile', 'roofing sheet', 'alu '] },
  { materialId: 'iron', bin: 'metal', keywords: ['iron', 'condemn', 'steel', 'rod', 'bed frame', 'zinc', 'tin', 'tins', 'tomato tin', 'milk tin', 'scrap metal', 'metal', 'nail'] },
  { bin: 'ewaste', keywords: ['battery', 'batteries', 'inverter battery', 'car battery'], label: 'Batteries (hazardous)', advice: 'Never burn or break batteries. Swollen or leaking ones: tape the ends and take them to an EPRON e-waste centre. Car/inverter batteries are bought by battery recyclers; ask the collector.' },
  { materialId: 'ewaste', bin: 'ewaste', keywords: ['phone', 'laptop', 'charger', 'radio', 'tv', 'television', 'fan', 'keyboard', 'mouse', 'remote', 'electronic', 'e-waste', 'ewaste', 'computer', 'printer', 'decoder', 'iron pressing', 'blender', 'bulb', 'bulbs'] },
  { materialId: 'glass', bin: 'glass', keywords: ['glass', 'jar', 'beer bottle', 'wine bottle', 'mirror'] },
  { materialId: 'carton', bin: 'paper', keywords: ['carton', 'cardboard', 'box', 'boxes', 'paali', 'packaging'] },
  { materialId: 'paper', bin: 'paper', keywords: ['paper', 'newspaper', 'book', 'books', 'exercise book', 'printout', 'magazine', 'receipt'] },
  { materialId: 'hard_plastic', bin: 'plastic', keywords: ['bucket', 'chair', 'bowl', 'jerrycan', 'jerry can', 'keg', 'gallon', 'basin', 'bottle cap', 'caps', 'container', 'rubber', 'plastic plate'] },
  { materialId: 'pet_clear', bin: 'plastic', keywords: ['bottle', 'bottles', 'pet', 'plastic bottle', 'water bottle', 'coke bottle', 'pepsi', 'eva water', 'plastic', 'rubber bottle'] },
  // not recyclable for cash
  { bin: 'general', keywords: ['food', 'leftover', 'peel', 'bones', 'diaper', 'pampers', 'sanitary', 'pad', 'tissue', 'serviette', 'styrofoam', 'take-away pack', 'takeaway pack', 'food pack', 'foil', 'ceramic', 'plate', 'chewing gum', 'cigarette', 'sand', 'dust', 'nappy'], label: 'General waste', advice: 'Not bought by recyclers. Bag it for your waste collector (PSP / LAWMA in Lagos, RIWAMA in Rivers, AEPB in Abuja). Food scraps can be composted at home. Lagos banned single-use styrofoam in 2024.' },
  { bin: 'general', keywords: ['needle', 'syringe', 'sharps', 'medicine', 'drugs', 'expired drug'], label: 'Medical waste (hazardous)', advice: 'Do not sell or mix with recyclables. Return expired drugs and sharps to a pharmacy or hospital for safe disposal.' },
]

export interface AssistantAnswer {
  query: string
  matched: boolean
  bin: BinId
  binLabel: string
  title: string
  material?: Material
  kg?: number
  valueText?: string
  tips: string[]
  note?: string
}

const norm = (s: string) => ' ' + s.toLowerCase().replace(/[^a-z0-9.\- ]+/g, ' ').replace(/\s+/g, ' ') + ' '

/** parse "20 bottles", "3kg", "2.5 kilos", "500g", "half kg" */
export function parseQuantity(text: string, m?: Material): number | undefined {
  const t = text.toLowerCase()
  const kg = t.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilo|kilos|kilogram|kilograms)\b/)
  if (kg) return parseFloat(kg[1])
  const g = t.match(/(\d+(?:\.\d+)?)\s*(g|gram|grams)\b/)
  if (g) return parseFloat(g[1]) / 1000
  if (/half (a )?(kg|kilo)/.test(t)) return 0.5
  if (m?.itemGrams) {
    const n = t.match(/(\d+)\s*(pieces|pcs|bottles?|cans?|units?)?/)
    if (n) return (parseInt(n[1], 10) * m.itemGrams.grams) / 1000
  }
  return undefined
}

export function ask(query: string): AssistantAnswer {
  const q = norm(query)
  for (const r of RULES) {
    if (r.exclude && r.exclude.some((x) => q.includes(' ' + x + ' '))) continue
    const hit = r.keywords.find((k) => q.includes(' ' + k + ' ') || q.includes(' ' + k + 's ') || (k.includes(' ') && q.includes(k)))
    if (!hit) continue
    const material = r.materialId ? materialById(r.materialId) : undefined
    const bin = BINS[r.bin]
    if (!material) {
      return { query, matched: true, bin: r.bin, binLabel: bin.label, title: r.label ?? bin.label, tips: [], note: r.advice }
    }
    const kg = parseQuantity(query, material)
    const band = priceBand(material)
    let valueText: string
    if (!band.hasPrice) valueText = material.cashNote ?? 'No reliable cash price.'
    else if (kg) valueText = `About ${naira(band.low * kg)}–${naira(band.high * kg)} for ${kg < 1 ? Math.round(kg * 1000) + ' g' : kg + ' kg'} (typical ${naira(band.typical * kg)}).`
    else valueText = `${naira(band.low)}–${naira(band.high)} per kg (typical ${naira(band.typical)}/kg).`
    return {
      query,
      matched: true,
      bin: r.bin,
      binLabel: bin.label,
      title: material.name,
      material,
      kg,
      valueText,
      tips: material.prep,
      note: material.cashNote,
    }
  }
  return {
    query,
    matched: false,
    bin: 'general',
    binLabel: 'Not sure yet',
    title: 'I don’t recognise that yet',
    tips: ['Try one item at a time, e.g. “20 water bottles”, “old phone charger”, “3kg cans”.', 'If it is mixed material (e.g. a shoe), it usually goes in general waste.'],
  }
}

export const EXAMPLES = ['30 pure water bottles', '2kg malt cans', 'old phone charger', 'pure water sachets', 'broken plastic chair', 'used diapers', 'condemn iron', 'carton boxes']
