import { describe, it, expect } from 'vitest'
import { MATERIALS, co2SavedPerKg, materialById } from '../src/data/materials'
import { COLLECTORS } from '../src/data/collectors'
import { SOURCES } from '../src/data/sources'
import { priceBand, estimateCart } from '../src/lib/estimate'
import { ask, parseQuantity } from '../src/lib/assistant'
import { toWaDigits, pickupMessage } from '../src/lib/whatsapp'

describe('price table', () => {
  it('every quote cites a known source', () => {
    const ids = new Set(SOURCES.map((s) => s.id))
    for (const m of MATERIALS) for (const q of m.quotes) expect(ids.has(q.sourceId), `${m.id}:${q.sourceId}`).toBe(true)
  })
  it('band is min / median of mid-points / max', () => {
    const b = priceBand(materialById('pet_clear')!) // 200, 250, 120, 290 -> median 225
    expect(b.low).toBe(120)
    expect(b.high).toBe(300)
    expect(b.typical).toBe(225)
  })
  it('unpriced materials report no price', () => {
    expect(priceBand(materialById('ewaste')!).hasPrice).toBe(false)
  })
})

describe('CO2 factors (EPA WARM v16)', () => {
  it('aluminium cans ≈ 10.09 kg CO2e/kg', () => {
    expect(co2SavedPerKg(materialById('al_cans')!)).toBeCloseTo(10.086, 2)
  })
  it('cardboard matches the published worked example (3.32 × 1.102311)', () => {
    expect(co2SavedPerKg(materialById('carton')!)).toBeCloseTo(3.66, 2)
  })
})

describe('cart estimate', () => {
  it('sums lines', () => {
    const e = estimateCart([{ materialId: 'pet_clear', kg: 10 }, { materialId: 'al_cans', kg: 2 }])
    expect(e.kg).toBe(12)
    expect(e.low).toBe(120 * 10 + 360 * 2)
  })
})

describe('offline assistant', () => {
  it('pure water bottles are PET, not sachets', () => {
    const a = ask('30 pure water bottles')
    expect(a.material?.id).toBe('pet_clear')
    expect(a.kg).toBeCloseTo(0.6)
  })
  it('sachets', () => expect(ask('pure water sachets').material?.id).toBe('sachet'))
  it('cans with kg', () => {
    const a = ask('2kg malt cans')
    expect(a.material?.id).toBe('al_cans')
    expect(a.kg).toBe(2)
  })
  it('pidgin "condemn" = iron', () => expect(ask('condemn iron').material?.id).toBe('iron'))
  it('pressing iron is e-waste', () => expect(ask('old pressing iron').bin).toBe('ewaste'))
  it('diapers are general waste', () => expect(ask('used diapers').bin).toBe('general'))
  it('unknown', () => expect(ask('xyzzy').matched).toBe(false))
  it('grams', () => expect(parseQuantity('500g')).toBe(0.5))
})

describe('whatsapp', () => {
  it('normalises Nigerian numbers', () => {
    expect(toWaDigits('0803 123 4567')).toBe('2348031234567')
    expect(toWaDigits('+234 803 123 4567')).toBe('2348031234567')
    expect(toWaDigits('123')).toBeNull()
  })
  it('collector WhatsApp numbers are valid', () => {
    for (const c of COLLECTORS) if (c.whatsapp) expect(c.whatsapp, c.id).toMatch(/^234\d{10}$/)
  })
  it('builds a message with items and details', () => {
    const c = COLLECTORS.find((x) => x.id === 'fifthseed-eleme')!
    const msg = pickupMessage(c, [{ materialId: 'pet_clear', kg: 5 }], { name: 'Ada', area: 'Rumuola', landmark: '', when: 'Sat' })
    expect(msg).toContain('PET bottles')
    expect(msg).toContain('Ada')
    expect(msg).toContain('Rumuola')
  })
})

describe('collectors', () => {
  it('cover all three cities and only known materials', () => {
    const cities = new Set(COLLECTORS.map((c) => c.city))
    expect(cities.size).toBe(3)
    for (const c of COLLECTORS) for (const id of c.accepts) expect(materialById(id), `${c.id}:${id}`).toBeTruthy()
  })
})
