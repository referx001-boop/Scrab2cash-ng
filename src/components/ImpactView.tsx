import { useState } from 'react'
import { MATERIALS, co2SavedPerKg, materialById } from '../data/materials'
import { naira, kgFmt, priceBand } from '../lib/estimate'
import { AnimatedNumber, Button, Card, EmptyState, IconButton, Label, SectionHeader, Segmented, Select, Stepper, inputCls, useToast } from './ui'
import { BIN_TONE, Icon, MaterialIcon, type IconName } from './icons'

export interface LogEntry {
  id: string
  date: string // ISO
  materialId: string
  kg: number
  naira: number // received (or estimated typical)
  estimated: boolean
  collectorId?: string
}

interface Props {
  log: LogEntry[]
  setLog: (l: LogEntry[]) => void
}

export function totals(log: LogEntry[]) {
  let kg = 0,
    co2 = 0,
    money = 0,
    bottles = 0
  const byMat: Record<string, number> = {}
  for (const e of log) {
    const m = materialById(e.materialId)
    if (!m) continue
    kg += e.kg
    co2 += co2SavedPerKg(m) * e.kg
    money += e.naira
    if (m.itemGrams) bottles += (e.kg * 1000) / m.itemGrams.grams
    byMat[e.materialId] = (byMat[e.materialId] ?? 0) + e.kg
  }
  return { kg, co2, money, bottles, byMat }
}

type Metric = 'kg' | 'co2' | 'naira'

function byMaterial(log: LogEntry[], metric: Metric) {
  const out: Record<string, number> = {}
  for (const e of log) {
    const m = materialById(e.materialId)
    if (!m) continue
    const v = metric === 'kg' ? e.kg : metric === 'co2' ? co2SavedPerKg(m) * e.kg : e.naira
    out[e.materialId] = (out[e.materialId] ?? 0) + v
  }
  return Object.entries(out).sort((a, b) => b[1] - a[1])
}

const fmtMetric = (metric: Metric, v: number) => (metric === 'kg' ? kgFmt(v) : metric === 'co2' ? `${v.toFixed(1)} kg` : naira(v))

export function ImpactView({ log, setLog }: Props) {
  const toast = useToast()
  const [mat, setMat] = useState('pet_clear')
  const [kg, setKg] = useState('')
  const [paid, setPaid] = useState('')
  const [metric, setMetric] = useState<Metric>('kg')
  const t = totals(log)
  const rows = byMaterial(log, metric)
  const sum = rows.reduce((a, [, v]) => a + v, 0) || 1
  const max = Math.max(1e-9, ...rows.map(([, v]) => v))

  const add = () => {
    const k = parseFloat(kg)
    if (!(k > 0)) return
    const m = materialById(mat)!
    const p = parseFloat(paid)
    const entry: LogEntry = {
      id: Date.now().toString(36),
      date: new Date().toISOString(),
      materialId: mat,
      kg: k,
      naira: p >= 0 && paid !== '' ? p : priceBand(m).typical * k,
      estimated: !(p >= 0 && paid !== ''),
    }
    setLog([entry, ...log])
    setKg('')
    setPaid('')
    toast(`Saved ${kgFmt(k)} of ${m.short}`, 'leaf')
  }

  const exportCsv = () => {
    const rows = [['date', 'material', 'kg', 'naira', 'naira_is_estimate', 'co2e_kg_saved']]
    for (const e of log) {
      const m = materialById(e.materialId)
      rows.push([e.date, m?.name ?? e.materialId, String(e.kg), String(Math.round(e.naira)), String(e.estimated), m ? (co2SavedPerKg(m) * e.kg).toFixed(2) : ''])
    }
    const blob = new Blob([rows.map((r) => r.map((x) => `"${x.replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'scrap2cash-impact.csv'
    a.click()
    toast('Exported scrap2cash-impact.csv', 'download')
  }

  const stats: { label: string; value: number; fmt: (n: number) => string; icon: IconName; tone: string }[] = [
    { label: 'Waste diverted', value: t.kg, fmt: kgFmt, icon: 'scale', tone: 'bg-brand-50 text-brand-700 ring-brand-100' },
    { label: 'CO₂e avoided', value: t.co2, fmt: (n) => `${n.toFixed(1)} kg`, icon: 'cloud', tone: 'bg-sky-50 text-sky-700 ring-sky-100' },
    { label: 'Earned', value: t.money, fmt: naira, icon: 'wallet', tone: 'bg-gold-100 text-gold-600 ring-amber-200' },
    { label: 'Bottles & cans', value: t.bottles, fmt: (n) => Math.round(n).toLocaleString('en-NG'), icon: 'recycle', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Your impact</h1>
        <p className="mt-0.5 text-sm text-stone-600">Every sale or hand-over you log, saved only on this phone.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)] ring-1 ring-stone-900/[0.06]">
            <span aria-hidden className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-inset ${s.tone}`}>
              <Icon name={s.icon} size={18} />
            </span>
            <p className="mt-3 text-xs font-semibold text-stone-600">{s.label}</p>
            <AnimatedNumber value={s.value} format={s.fmt} fromZero className="mt-0.5 block text-[1.6rem] leading-tight font-extrabold tracking-tight text-stone-900" />
          </div>
        ))}
      </div>
      <p className="flex gap-2 px-1 text-xs leading-relaxed text-stone-600">
        <Icon name="info" size={15} className="mt-px text-stone-400" />
        <span>
          CO₂e uses US EPA WARM v16 recycling-vs-landfill factors, a screening estimate rather than an audited figure. In Nigeria much waste is burned or dumped, not landfilled, so the true benefit
          differs. Bottle and can counts assume ~50 per kg.
        </span>
      </p>

      <div className="grid grid-cols-1 gap-5 *:min-w-0 lg:grid-cols-12 lg:items-start lg:gap-8">
        {log.length === 0 ? (
          <Card className="lg:col-span-7">
            <EmptyState icon="chart" title="No impact logged yet" body="Log a sale or hand-over, or tap “Handed over?” after a pickup, and your charts will appear here." />
          </Card>
        ) : (
          <Card className="lg:col-span-7">
            <SectionHeader icon="chart" title="By material" />
            <Segmented
              label="Chart metric"
              className="mt-4"
              value={metric}
              onChange={setMetric}
              options={[
                { value: 'kg', label: 'Weight' },
                { value: 'co2', label: 'CO₂e' },
                { value: 'naira', label: 'Naira' },
              ]}
            />
            {/* share strip */}
            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-stone-100" aria-hidden>
              {rows.map(([id, v]) => {
                const m = materialById(id)!
                return <span key={id + metric} className={`h-full origin-left animate-grow border-r-2 border-white last:border-r-0 ${BIN_TONE[m.bin].bar}`} style={{ width: `${(v / sum) * 100}%` }} />
              })}
            </div>
            <ul className="mt-5 space-y-3.5">
              {rows.map(([id, v]) => {
                const m = materialById(id)!
                return (
                  <li key={id}>
                    <div className="flex items-center gap-2.5 text-sm">
                      <MaterialIcon id={m.id} bin={m.bin} size="sm" />
                      <span className="min-w-0 flex-1 truncate font-medium text-stone-800">{m.name}</span>
                      <span className="tabular text-xs text-stone-500">{Math.round((v / sum) * 100)}%</span>
                      <span className="tabular w-20 text-right font-bold text-stone-900">{fmtMetric(metric, v)}</span>
                    </div>
                    <div className="mt-1.5 ml-[2.625rem] h-2 rounded-full bg-stone-100" aria-hidden>
                      <div key={metric} className={`h-2 origin-left animate-grow rounded-full ${BIN_TONE[m.bin].bar}`} style={{ width: `${Math.max(2, (v / max) * 100)}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        )}
        <div className="lg:sticky lg:top-24 lg:col-span-5 lg:row-span-2 lg:self-start">
          <Card>
            <SectionHeader icon="plus" title="Log a sale or hand-over" />
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="lmat">Material</Label>
                <Select id="lmat" value={mat} onChange={(e) => setMat(e.target.value)}>
                  {MATERIALS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <Label htmlFor="lkg">Weight (kg)</Label>
                  <Stepper id="lkg" value={kg} onChange={setKg} decimals suffix="kg" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="lpaid">₦ received (optional)</Label>
                  <div className="relative">
                    <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-semibold text-stone-500">
                      ₦
                    </span>
                    <input
                      id="lpaid"
                      inputMode="numeric"
                      className={`${inputCls} tabular pl-8`}
                      value={paid}
                      onChange={(e) => setPaid(e.target.value.replace(/[^\d.]/g, ''))}
                      placeholder="blank = estimate"
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button size="lg" icon="check" className="mt-4 w-full" onClick={add} disabled={!(parseFloat(kg) > 0)}>
              Save
            </Button>
          </Card>
        </div>
        {log.length > 0 && (
          <Card className="lg:col-span-7">
            <SectionHeader
              icon="clock"
              title="History"
              right={
                <div className="flex gap-1">
                  <Button variant="secondary" size="sm" icon="download" onClick={exportCsv}>
                    Export CSV
                  </Button>
                </div>
              }
            />
            <ul className="mt-3 divide-y divide-stone-100 text-sm">
              {log.slice(0, 30).map((e) => {
                const m = materialById(e.materialId)
                return (
                  <li key={e.id} className="flex items-center gap-3 py-2.5">
                    {m && <MaterialIcon id={m.id} bin={m.bin} size="sm" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-stone-900">
                        {m?.name} · {kgFmt(e.kg)}
                      </span>
                      <span className="tabular block text-xs text-stone-600">
                        {new Date(e.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })} · {naira(e.naira)}
                        {e.estimated ? ' (est.)' : ''}
                      </span>
                    </span>
                    <IconButton
                      icon="trash"
                      tone="danger"
                      label="Delete entry"
                      onClick={() => {
                        setLog(log.filter((x) => x.id !== e.id))
                        toast('Entry deleted', 'trash')
                      }}
                    />
                  </li>
                )
              })}
            </ul>
            <div className="mt-3 border-t border-stone-100 pt-3">
              <Button
                variant="danger"
                size="sm"
                icon="trash"
                onClick={() => {
                  if (confirm('Delete all impact history on this phone?')) {
                    setLog([])
                    toast('Impact history reset', 'trash')
                  }
                }}
              >
                Reset history
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
