import { useMemo, useState } from 'react'
import { COLLECTORS, CITIES, type City, type Collector } from '../data/collectors'
import { MATERIALS, materialById } from '../data/materials'
import { haversineKm, mapsLink } from '../lib/geo'
import { Badge, Card, EmptyState, Label, LinkButton, Button, Segmented, Select, SectionHeader } from './ui'
import { Icon, MaterialIcon } from './icons'

interface Props {
  city: City
  setCity: (c: City) => void
}

export function VerifiedBadge({ v }: { v: Collector['verified'] }) {
  if (v === 'website')
    return (
      <Badge tone="green" icon="shield">
        From their website
      </Badge>
    )
  if (v === 'directory')
    return (
      <Badge tone="sky" icon="list">
        EPRON official list
      </Badge>
    )
  return (
    <Badge tone="amber" icon="alert">
      Demo data · confirm first
    </Badge>
  )
}

export function CityPicker({ city, onChange, label = 'City' }: { city: City; onChange: (c: City) => void; label?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-stone-700" aria-hidden>
        {label}
      </p>
      <Segmented label={label} value={city} onChange={onChange} options={CITIES.map((c) => ({ value: c, label: c }))} />
    </div>
  )
}

export function CollectorCard({ c, km }: { c: Collector; km?: number }) {
  const tel = c.phone ? 'tel:' + c.phone.replace(/\s/g, '') : undefined
  return (
    <article className="flex h-full animate-pop flex-col rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)] ring-1 ring-stone-900/[0.06] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] sm:p-5">
      <div>
        <div className="min-w-0">
          <h3 className="leading-snug font-bold text-stone-900">{c.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-stone-600">
            <Icon name="pin" size={14} className="text-stone-400" />
            {c.area}
            {km !== undefined && <span className="tabular font-semibold text-brand-700"> · ~{km < 10 ? km.toFixed(1) : Math.round(km)} km</span>}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-stone-700">{c.address}</p>
      <p className="mt-2 flex gap-2 rounded-xl bg-stone-50 p-2.5 text-sm text-stone-700 ring-1 ring-inset ring-stone-200/70">
        <Icon name="wallet" size={16} className="mt-0.5 text-brand-600" />
        <span>{c.howItPays}</span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Accepts">
        {c.accepts.map((id) => {
          const m = materialById(id)
          return m ? (
            <li key={id} className="inline-flex items-center gap-1 rounded-full bg-white py-0.5 pr-2.5 pl-0.5 text-xs font-medium text-stone-700 ring-1 ring-stone-200">
              <span className="scale-[0.7]">
                <MaterialIcon id={m.id} bin={m.bin} size="sm" />
              </span>
              <span className="-ml-1">{m.short}</span>
            </li>
          ) : null
        })}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-600">
        <VerifiedBadge v={c.verified} />
        <Badge icon={c.kind === 'dropoff' ? 'pin' : 'truck'}>{c.kind === 'both' ? 'Pickup + drop-off' : c.kind === 'pickup' ? 'Pickup' : 'Drop-off'}</Badge>
        <a
          className="inline-flex min-h-8 items-center gap-1 font-medium text-stone-600 underline decoration-stone-300 underline-offset-2 hover:text-stone-900"
          href={c.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          source
          <Icon name="external" size={12} />
        </a>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {tel && (
          <LinkButton variant="secondary" icon="phone" href={tel}>
            Call
          </LinkButton>
        )}
        {c.whatsapp && (
          <LinkButton variant="whatsapp" icon="whatsapp" href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer">
            WhatsApp
          </LinkButton>
        )}
        <LinkButton variant="ghost" icon="directions" href={mapsLink(`${c.address}, ${c.city}, Nigeria`)} target="_blank" rel="noreferrer">
          Directions
        </LinkButton>
      </div>
    </article>
  )
}

function SkeletonCard() {
  return (
    <div aria-hidden className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-stone-900/[0.06]">
      <div className="skeleton h-4 w-2/3 rounded" />
      <div className="skeleton mt-2 h-3 w-1/3 rounded" />
      <div className="skeleton mt-4 h-12 rounded-xl" />
      <div className="mt-4 flex gap-2">
        <div className="skeleton h-11 w-20 rounded-xl" />
        <div className="skeleton h-11 w-28 rounded-xl" />
      </div>
    </div>
  )
}

export function CollectorsView({ city, setCity }: Props) {
  const [material, setMaterial] = useState('')
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null)
  const [geoMsg, setGeoMsg] = useState('')
  const [locating, setLocating] = useState(false)

  const list = useMemo(() => {
    const rows = COLLECTORS.filter((c) => c.city === city && (!material || c.accepts.includes(material))).map((c) => ({
      c,
      km: me ? haversineKm(me, c) : undefined,
    }))
    if (me) rows.sort((a, b) => (a.km ?? 0) - (b.km ?? 0))
    return rows
  }, [city, material, me])

  const locate = () => {
    if (!('geolocation' in navigator)) return setGeoMsg('Location is not available on this device.')
    setGeoMsg('Finding you…')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setMe({ lat: p.coords.latitude, lng: p.coords.longitude })
        setLocating(false)
        setGeoMsg('Sorted by distance from you (approximate pins). Your location never leaves your phone.')
      },
      () => {
        setLocating(false)
        setGeoMsg('Could not get your location. You can still browse the list.')
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    )
  }

  return (
    <div className="space-y-5">
      <Card>
        <SectionHeader icon="pin" title="Collectors near you" subtitle="Recyclers, buy-back centres and e-waste points." />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CityPicker city={city} onChange={setCity} />
          <div>
            <Label htmlFor="mat">Accepts</Label>
            <Select id="mat" value={material} onChange={(e) => setMaterial(e.target.value)}>
              <option value="">Any material</option>
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={locate} disabled={locating} aria-busy={locating}>
            {locating ? <span aria-hidden className="h-4 w-4 animate-spin-slow rounded-full border-2 border-brand-200 border-t-brand-700" /> : <Icon name="locate" size={18} />}
            Sort by distance
          </Button>
          <p className="min-w-0 flex-1 text-xs text-stone-600" aria-live="polite">
            {geoMsg}
          </p>
        </div>
        <p className="mt-3 border-t border-stone-100 pt-3 text-xs text-stone-600">
          <strong className="text-stone-900">
            {list.length} place{list.length === 1 ? '' : 's'}
          </strong>{' '}
          · gathered from public sources, Oct 2026. Hours, prices and numbers change: call before you go.
        </p>
      </Card>

      {list.length === 0 && (
        <Card>
          <EmptyState
            icon="search"
            title="No match here yet"
            body={`No listed collector in ${city} takes that yet. Try “Any material” or another city.`}
            action={
              <Button variant="secondary" onClick={() => setMaterial('')}>
                Show any material
              </Button>
            }
          />
        </Card>
      )}
      <div className="grid grid-cols-1 gap-4 *:min-w-0 md:grid-cols-2">
        {locating && list.length > 0 ? [0, 1].map((i) => <SkeletonCard key={i} />) : list.map(({ c, km }) => <CollectorCard key={c.id + city + material} c={c} km={km} />)}
      </div>
    </div>
  )
}
