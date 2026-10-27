import { useState } from 'react'
import { MATERIALS, BINS, co2SavedPerKg, materialById } from '../data/materials'
import { COLLECTORS, CITIES } from '../data/collectors'
import { SOURCES, sourceById } from '../data/sources'
import { estimateCart, priceBand, naira, kgFmt, type CartItem } from '../lib/estimate'
import { AnimatedNumber, Badge, Button, Card, EmptyState, IconButton, Label, Notice, SectionHeader, Segmented, Stepper, useToast } from './ui'
import { BIN_TONE, Icon, MaterialIcon } from './icons'

interface Props {
  cart: CartItem[]
  setCart: (c: CartItem[]) => void
  goPickup: () => void
  goCollectors: () => void
  impactKg: number
  impactCo2: number
}

export function BinBadge({ bin, label }: { bin: keyof typeof BINS; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ring-1 ring-inset ${BIN_TONE[bin].badge}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${BIN_TONE[bin].dot}`} />
      {label ?? BINS[bin].label}
    </span>
  )
}

function Hero({ goCollectors, impactKg, impactCo2 }: { goCollectors: () => void; impactKg: number; impactCo2: number }) {
  const stats = [
    { v: String(MATERIALS.length), l: 'materials priced' },
    { v: String(COLLECTORS.length), l: `collectors in ${CITIES.length} cities` },
    { v: String(SOURCES.length), l: 'price sources' },
  ]
  return (
    <section aria-labelledby="hero-title" className="hero-bg relative overflow-hidden rounded-[1.5rem] px-5 pt-5 pb-5 text-white shadow-[var(--shadow-float)] sm:px-8 sm:pt-8 lg:px-10 lg:py-10">
      <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full border border-white/10" />
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full border border-white/5" />
      <div className="relative lg:flex lg:items-end lg:justify-between lg:gap-10">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-brand-100 ring-1 ring-white/15">
            <Icon name="offline" size={13} strokeWidth={2.2} />
            Works offline · No sign-up
          </p>
          <h1 id="hero-title" className="mt-3 text-[1.625rem] leading-[1.15] font-extrabold tracking-tight sm:text-4xl">
            Turn your waste into <span className="text-gold-300">naira</span>.
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-brand-100 sm:text-[0.95rem]">
            See what your recyclables are worth, find a collector in Lagos, Port Harcourt or Abuja, and request a pickup on WhatsApp.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:flex sm:flex-wrap">
            <a
              href="#materials"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('materials')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold whitespace-nowrap sm:px-5 sm:text-[0.95rem] text-brand-900 shadow-[var(--shadow-lift)] transition-[transform,background-color] duration-150 hover:bg-brand-50 active:scale-[0.97]"
            >
              Estimate my waste
              <Icon name="arrowRight" size={18} />
            </a>
            <button
              onClick={goCollectors}
              className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold whitespace-nowrap text-white sm:px-4 sm:text-[0.95rem] ring-1 ring-white/30 transition-[transform,background-color] duration-150 hover:bg-white/10 active:scale-[0.97]"
            >
              <Icon name="pin" size={18} className="hidden sm:inline" />
              Find collectors
            </button>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 lg:mt-0 lg:w-80 lg:shrink-0">
          {stats.map((s) => (
            <div key={s.l} className="rounded-xl bg-white/[0.08] px-3 py-2 ring-1 ring-white/10">
              <dt className="sr-only">{s.l}</dt>
              <dd>
                <span className="tabular block text-lg leading-tight font-extrabold">{s.v}</span>
                <span className="block text-[0.7rem] leading-tight text-brand-100">{s.l}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {impactKg > 0 && (
        <p className="relative mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-brand-50 ring-1 ring-white/10">
          <Icon name="leaf" size={15} className="text-brand-300" />
          You’ve diverted {impactKg.toFixed(1)} kg and avoided {impactCo2.toFixed(1)} kg CO₂e so far.
        </p>
      )}
    </section>
  )
}

function RangeBar({ low, typical, high }: { low: number; typical: number; high: number }) {
  const pos = high > low ? ((typical - low) / (high - low)) * 100 : 50
  return (
    <div className="mt-4" aria-hidden>
      <div className="relative h-2 rounded-full bg-gradient-to-r from-brand-100 via-brand-300 to-brand-500">
        <span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[var(--shadow-lift)] ring-[3px] ring-brand-700 transition-[left] duration-500 ease-[var(--ease-out-soft)]"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="tabular mt-1.5 flex justify-between text-[0.7rem] font-medium text-stone-500">
        <span>Low {naira(low)}</span>
        <span>High {naira(high)}</span>
      </div>
    </div>
  )
}

export function EstimateView({ cart, setCart, goPickup, goCollectors, impactKg, impactCo2 }: Props) {
  const toast = useToast()
  const [selected, setSelected] = useState<string>('pet_clear')
  const [kg, setKg] = useState('')
  const [count, setCount] = useState('')
  const [mode, setMode] = useState<'kg' | 'count'>('kg')
  const [showSources, setShowSources] = useState(false)
  const m = materialById(selected)!
  const band = priceBand(m)
  const est = estimateCart(cart)
  const useCount = mode === 'count' && !!m.itemGrams

  const pendingKg = (() => {
    if (!useCount) {
      const k = parseFloat(kg)
      return k > 0 ? k : 0
    }
    const n = parseInt(count, 10)
    return n > 0 && m.itemGrams ? (n * m.itemGrams.grams) / 1000 : 0
  })()

  const pick = (id: string) => {
    setSelected(id)
    if (!materialById(id)?.itemGrams) setMode('kg')
  }

  const add = () => {
    if (!(pendingKg > 0)) return
    const existing = cart.find((c) => c.materialId === selected)
    const next = existing ? cart.map((c) => (c.materialId === selected ? { ...c, kg: +(c.kg + pendingKg).toFixed(3) } : c)) : [...cart, { materialId: selected, kg: +pendingKg.toFixed(3) }]
    setCart(next)
    setKg('')
    setCount('')
    toast(`Added ${kgFmt(pendingKg)} of ${m.short} to your bag`, 'bag')
  }

  return (
    <div className="space-y-5 lg:space-y-8">
      <Hero goCollectors={goCollectors} impactKg={impactKg} impactCo2={impactCo2} />

      <div className="grid grid-cols-1 gap-5 *:min-w-0 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="space-y-5 lg:col-span-7">
          <Card id="materials" className="scroll-mt-20">
            <SectionHeader step={1} title="What do you have?" subtitle="Tap a material. Prices are estimates from Nigerian buyers in 2025–2026." />
            <div role="radiogroup" aria-label="Material" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MATERIALS.map((x) => {
                const on = selected === x.id
                const b = priceBand(x)
                return (
                  <button
                    key={x.id}
                    role="radio"
                    aria-checked={on}
                    onClick={() => pick(x.id)}
                    className={`group relative flex min-h-[4.25rem] flex-col items-start gap-1.5 rounded-2xl p-2.5 sm:flex-row sm:items-center sm:gap-2.5 text-left ring-1 transition-[background-color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] ${
                      on ? 'bg-brand-50/70 ring-2 ring-brand-600 shadow-[var(--shadow-card)]' : 'bg-white ring-stone-200 hover:bg-stone-50 hover:ring-stone-300 hover:shadow-[var(--shadow-card)]'
                    }`}
                  >
                    <MaterialIcon id={x.id} bin={x.bin} />
                    <span className="min-w-0 w-full sm:pr-3">
                      <span className="line-clamp-2 block text-[0.8125rem] leading-tight font-semibold text-stone-900">{x.name}</span>
                      <span className={`tabular mt-0.5 block text-xs ${b.hasPrice ? 'font-semibold text-brand-700' : 'text-stone-500'}`}>
                        {b.hasPrice ? `${naira(b.typical)}/kg` : 'On inspection'}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`absolute top-1.5 right-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white transition-[opacity,transform] duration-200 ${on ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                    >
                      <Icon name="check" size={11} strokeWidth={3} />
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <MaterialIcon id={m.id} bin={m.bin} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h2 className="text-lg leading-snug font-bold tracking-tight text-stone-900">{m.name}</h2>
                </div>
                <p className="mt-0.5 text-sm text-stone-600">{m.examples}</p>
                <div className="mt-2">
                  <BinBadge bin={m.bin} />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-stone-50 p-4 ring-1 ring-inset ring-stone-200/70" aria-live="polite">
              {band.hasPrice ? (
                <>
                  <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">Typical price</p>
                  <p className="mt-0.5 flex items-baseline gap-1">
                    <AnimatedNumber value={band.typical} format={naira} className="text-3xl font-extrabold tracking-tight text-brand-900" />
                    <span className="text-sm font-medium text-stone-600">/kg typical</span>
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    Range {naira(band.low)}–{naira(band.high)}/kg from {band.quoteCount} source{band.quoteCount > 1 ? 's' : ''}
                  </p>
                  <RangeBar low={band.low} typical={band.typical} high={band.high} />
                </>
              ) : (
                <p className="flex gap-2 text-sm text-stone-700">
                  <Icon name="info" size={18} className="mt-px text-stone-500" />
                  {m.cashNote}
                </p>
              )}
              <p className="mt-3 flex items-center gap-1.5 text-xs text-stone-600">
                <Icon name="leaf" size={14} className="text-brand-600" />
                Saves about {co2SavedPerKg(m).toFixed(2)} kg CO₂e per kg vs landfill (EPA WARM).
              </p>
              <button
                className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-lg text-sm font-semibold text-brand-700 hover:text-brand-900"
                onClick={() => setShowSources((s) => !s)}
                aria-expanded={showSources}
                aria-controls="price-sources"
              >
                {showSources ? 'Hide' : 'Show'} how we priced this
                <Icon name="chevronDown" size={16} className={`transition-transform duration-300 ${showSources ? 'rotate-180' : ''}`} />
              </button>
              <div id="price-sources" className="collapse-grid" data-open={showSources}>
                <div>
                  <ul className="space-y-2 pt-1 text-xs text-stone-700">
                    {m.quotes.map((q, i) => {
                      const s = sourceById(q.sourceId)
                      return (
                        <li key={i} className="flex gap-2 rounded-xl bg-white p-2.5 ring-1 ring-stone-200">
                          <span className="tabular shrink-0 font-bold text-stone-900">{q.low === q.high ? naira(q.low) : `${naira(q.low)}–${naira(q.high)}`}/kg</span>
                          <span className="min-w-0">
                            {q.note && <span className="block text-stone-600">{q.note}</span>}
                            <a
                              className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-900"
                              href={s?.url}
                              target="_blank"
                              rel="noreferrer"
                              tabIndex={showSources ? 0 : -1}
                            >
                              {s?.title ?? q.sourceId}
                            </a>
                          </span>
                        </li>
                      )
                    })}
                    {band.hasPrice && <li className="px-1 text-stone-600 italic">Typical = median of these quotes. Low/high = lowest/highest quote.</li>}
                    {m.warm.proxy && <li className="px-1 text-stone-600 italic">CO₂ factor uses WARM “{m.warm.proxy}” as a proxy.</li>}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-5">
              {m.itemGrams && (
                <Segmented
                  label="Measure by"
                  className="mb-3"
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: 'kg', label: 'By weight' },
                    { value: 'count', label: 'By count' },
                  ]}
                />
              )}
              {useCount ? (
                <div key="count" className="animate-pop">
                  <Label htmlFor="count">How many {m.itemGrams!.label}s?</Label>
                  <Stepper id="count" value={count} onChange={setCount} step={10} placeholder="e.g. 50" suffix={m.itemGrams!.label + 's'} />
                  <p className="mt-1.5 text-xs text-stone-600">About 50 {m.itemGrams!.label}s ≈ 1 kg (Ecobarter).</p>
                </div>
              ) : (
                <div key="kg" className="animate-pop">
                  <Label htmlFor="kg">Weight (kg)</Label>
                  <Stepper id="kg" value={kg} onChange={setKg} step={1} decimals placeholder="e.g. 5" suffix="kg" />
                  {!m.itemGrams && <p className="mt-1.5 text-xs text-stone-600">No scale? Guess, then ask the collector to weigh in front of you before you agree a price.</p>}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="tabular min-h-5 text-sm text-stone-700" aria-live="polite">
                {pendingKg > 0 && band.hasPrice ? (
                  <>
                    {kgFmt(pendingKg)} ≈{' '}
                    <strong className="text-brand-800">
                      {naira(band.low * pendingKg)}–{naira(band.high * pendingKg)}
                    </strong>
                  </>
                ) : pendingKg > 0 ? (
                  `${kgFmt(pendingKg)} · price on inspection`
                ) : (
                  <span className="text-stone-500">Enter an amount to see its value</span>
                )}
              </p>
              <Button size="lg" icon="plus" onClick={add} disabled={!(pendingKg > 0)} className="w-full sm:w-auto">
                Add to my bag
              </Button>
            </div>

            <details className="group mt-5 rounded-2xl ring-1 ring-stone-200 open:bg-stone-50/60">
              <summary className="flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl px-3.5 text-sm font-semibold text-stone-800 hover:bg-stone-50">
                <Icon name="bulb" size={18} className="text-gold-600" />
                <span className="flex-1">Prep tips to get the best price</span>
                <Icon name="chevronDown" size={18} className="text-stone-500 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <ul className="space-y-2 px-3.5 pt-1 pb-3.5 text-sm text-stone-700">
                {m.prep.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Icon name="check" size={16} strokeWidth={2.4} className="mt-0.5 text-brand-600" />
                    {p}
                  </li>
                ))}
              </ul>
            </details>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:col-span-5">
          <Card id="bag">
            <SectionHeader
              step={2}
              title="My bag"
              right={
                cart.length > 0 ? (
                  <Badge tone="green">
                    {cart.length} item{cart.length > 1 ? 's' : ''}
                  </Badge>
                ) : undefined
              }
            />
            {cart.length === 0 ? (
              <EmptyState icon="bag" title="Your bag is empty" body="Nothing yet. Add a material above to see what your bag is worth." />
            ) : (
              <>
                <ul className="mt-3 divide-y divide-stone-100">
                  {est.lines.map((l) => (
                    <li key={l.materialId} className="flex animate-pop items-center gap-3 py-2.5">
                      <MaterialIcon id={l.materialId} bin={l.material.bin} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-stone-900">{l.material.name}</p>
                        <p className="tabular text-xs text-stone-600">
                          {kgFmt(l.kg)} · {l.band.hasPrice ? `${naira(l.low)}–${naira(l.high)}` : 'quote on inspection'}
                        </p>
                      </div>
                      <IconButton
                        icon="trash"
                        tone="danger"
                        label={`Remove ${l.material.name}`}
                        onClick={() => {
                          setCart(cart.filter((c) => c.materialId !== l.materialId))
                          toast(`Removed ${l.material.short}`, 'trash')
                        }}
                      />
                    </li>
                  ))}
                </ul>
                <div className="total-bg relative mt-3 overflow-hidden rounded-2xl p-4 text-white shadow-[var(--shadow-lift)]">
                  <div aria-hidden className="pointer-events-none absolute -right-8 -bottom-10 h-32 w-32 rounded-full border border-white/10" />
                  <p className="text-xs font-semibold tracking-wide text-brand-200 uppercase">Estimated value</p>
                  <AnimatedNumber value={est.typical} format={naira} className="mt-0.5 block text-[2.25rem] leading-tight font-extrabold tracking-tight" />
                  <p className="tabular text-sm text-brand-100">
                    Range {naira(est.low)}–{naira(est.high)}
                  </p>
                  <div className="tabular mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/10">
                      <Icon name="scale" size={13} /> {kgFmt(est.kg)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/10">
                      <Icon name="leaf" size={13} /> saves ~{est.co2.toFixed(1)} kg CO₂e
                    </span>
                  </div>
                  {est.unpriced.length > 0 && <p className="mt-2 text-xs text-brand-100">Not priced: {est.unpriced.join(', ')} (quote on inspection).</p>}
                </div>
                <div className="mt-3">
                  <Notice>
                    <strong>Estimate.</strong> Buyers weigh, inspect and may deduct for bags, water, sand or oil stains. Always confirm the price per kg first.
                  </Notice>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="lg" className="flex-1" iconRight="arrowRight" onClick={goPickup}>
                    Request pickup
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => {
                      setCart([])
                      toast('Bag cleared', 'trash')
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
