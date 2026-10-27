import { useMemo, useState } from 'react'
import { COLLECTORS, type City } from '../data/collectors'
import { estimateCart, naira, kgFmt, type CartItem } from '../lib/estimate'
import { pickupMessage, waLink, type PickupDetails } from '../lib/whatsapp'
import { load, save, KEYS } from '../lib/storage'
import { Button, Card, EmptyState, Label, LinkButton, Notice, SectionHeader, inputCls, useToast } from './ui'
import { CityPicker, VerifiedBadge } from './CollectorsView'
import { Icon, MaterialIcon } from './icons'

interface Props {
  cart: CartItem[]
  city: City
  setCity: (c: City) => void
  goEstimate: () => void
  onHandedOver: (collectorId: string) => void
}

const STEPS = ['Bag', 'Collector', 'Details', 'Send']

function Progress({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="Pickup steps">
      {STEPS.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'now' : 'todo'
        return (
          <li key={s} className="flex flex-1 flex-col gap-1.5" aria-current={state === 'now' ? 'step' : undefined}>
            <span className={`h-1.5 rounded-full transition-colors duration-500 ${state === 'todo' ? 'bg-stone-200' : 'bg-brand-600'}`} />
            <span className={`text-[0.7rem] font-semibold ${state === 'todo' ? 'text-stone-500' : 'text-brand-800'}`}>{s}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function PickupView({ cart, city, setCity, goEstimate, onHandedOver }: Props) {
  const toast = useToast()
  const [collectorId, setCollectorId] = useState('')
  const [d, setD] = useState<PickupDetails>(() => load(KEYS.profile, { name: '', area: '', landmark: '', when: '' }))
  const [copied, setCopied] = useState(false)
  const [done, setDone] = useState(false)
  const est = estimateCart(cart)
  const ids = cart.map((c) => c.materialId)

  const options = useMemo(
    () =>
      COLLECTORS.filter((c) => c.city === city && c.whatsapp)
        .map((c) => ({ c, matches: ids.filter((id) => c.accepts.includes(id)).length }))
        .filter((x) => x.matches > 0)
        .sort((a, b) => b.matches - a.matches),
    [city, ids.join(',')],
  )
  const chosen = options.find((o) => o.c.id === collectorId)?.c
  const msg = chosen
    ? pickupMessage(
        chosen,
        cart.filter((i) => chosen.accepts.includes(i.materialId)),
        d,
      )
    : ''

  const update = (k: keyof PickupDetails, v: string) => {
    const next = { ...d, [k]: v }
    setD(next)
    save(KEYS.profile, next)
  }

  if (cart.length === 0 && !done)
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <SectionHeader icon="truck" title="Request a pickup" />
          <EmptyState
            icon="bag"
            title="Your bag is empty"
            body="Your bag is empty. Add what you have first, then come back here."
            action={
              <Button size="lg" icon="plus" onClick={goEstimate}>
                Add items
              </Button>
            }
          />
        </Card>
      </div>
    )

  if (cart.length === 0 && done)
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <EmptyState
            icon="checkCircle"
            title="Logged to your impact. Well done!"
            body="Your hand-over is saved on this phone. Check the Impact tab to see your totals."
            action={
              <Button size="lg" icon="plus" variant="secondary" onClick={goEstimate}>
                Start a new bag
              </Button>
            }
          />
        </Card>
      </div>
    )

  return (
    <div className="space-y-5">
      <Card>
        <Progress current={chosen ? (d.name && d.area ? 3 : 2) : 1} />
      </Card>
      <div className="grid grid-cols-1 gap-5 *:min-w-0 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="space-y-5 lg:col-span-5">
          <Card>
            <SectionHeader step={1} title="Your bag" />
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {est.lines.map((l) => (
                <li key={l.materialId} className="tabular inline-flex items-center gap-1.5 rounded-full bg-stone-50 py-1 pr-3 pl-1 text-sm text-stone-700 ring-1 ring-stone-200">
                  <span className="scale-75">
                    <MaterialIcon id={l.materialId} bin={l.material.bin} size="sm" />
                  </span>
                  <span className="-ml-1">
                    {l.material.short} <strong className="font-semibold text-stone-900">{kgFmt(l.kg)}</strong>
                  </span>
                </li>
              ))}
            </ul>
            <p className="tabular mt-3 flex items-baseline justify-between rounded-xl bg-brand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-inset ring-brand-100">
              <span>Estimated</span>
              <strong className="text-base">
                ≈ {naira(est.low)}–{naira(est.high)}
              </strong>
            </p>
          </Card>

          <Card>
            <SectionHeader step={2} title="Choose a collector on WhatsApp" />
            <div className="mt-4">
              <CityPicker city={city} onChange={(c) => (setCity(c), setCollectorId(''))} />
            </div>
            {options.length === 0 ? (
              <EmptyState icon="search" title="No WhatsApp collector here yet" body={`No WhatsApp collector in ${city} takes these items yet. Check the Collectors tab for call-only places.`} />
            ) : (
              <fieldset className="mt-4 space-y-2">
                <legend className="sr-only">Collector</legend>
                {options.map(({ c, matches }) => {
                  const on = collectorId === c.id
                  return (
                    <label
                      key={c.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl p-3.5 ring-1 transition-[background-color,box-shadow] duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-400 ${
                        on ? 'bg-brand-50/70 shadow-[var(--shadow-card)] ring-2 ring-brand-600' : 'ring-stone-200 hover:bg-stone-50 hover:ring-stone-300'
                      }`}
                    >
                      <input type="radio" name="collector" className="peer sr-only" checked={on} onChange={() => setCollectorId(c.id)} />
                      <span
                        aria-hidden
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-2 transition-all duration-200 ${on ? 'bg-brand-600 ring-brand-600' : 'bg-white ring-stone-300'}`}
                      >
                        <span className={`h-2 w-2 rounded-full bg-white transition-transform duration-200 ${on ? 'scale-100' : 'scale-0'}`} />
                      </span>
                      <span className="min-w-0">
                        <span className="block leading-snug font-semibold text-stone-900">{c.name}</span>
                        <span className="mt-0.5 block text-xs text-stone-600">
                          {c.area} · takes {matches} of your {ids.length} item type{ids.length > 1 ? 's' : ''}
                        </span>
                        <span className="mt-2 block">
                          <VerifiedBadge v={c.verified} />
                        </span>
                      </span>
                    </label>
                  )
                })}
              </fieldset>
            )}
          </Card>
        </div>

        <div className="lg:col-span-7">
          {chosen ? (
            <Card className="animate-pop">
              <SectionHeader step={3} title="Your details" subtitle="Saved only on this phone. Nothing is sent until you press “Open WhatsApp”, then Send." />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <input id="name" className={inputCls} value={d.name} onChange={(e) => update('name', e.target.value)} autoComplete="given-name" />
                </div>
                <div>
                  <Label htmlFor="area">Area / street</Label>
                  <input id="area" className={inputCls} value={d.area} onChange={(e) => update('area', e.target.value)} placeholder="e.g. Rumuola, PH" autoComplete="address-line1" />
                </div>
                <div>
                  <Label htmlFor="landmark">Landmark</Label>
                  <input id="landmark" className={inputCls} value={d.landmark} onChange={(e) => update('landmark', e.target.value)} placeholder="e.g. opposite the church" />
                </div>
                <div>
                  <Label htmlFor="when">Best day / time</Label>
                  <input id="when" className={inputCls} value={d.when} onChange={(e) => update('when', e.target.value)} placeholder="e.g. Saturday morning" />
                </div>
              </div>
              {chosen.accepts.length < ids.length && (
                <div className="mt-4">
                  <Notice>This collector does not list all your items, so the message only includes the ones they take.</Notice>
                </div>
              )}

              <div className="mt-5 flex items-center gap-3">
                <span aria-hidden className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
                  4
                </span>
                <label htmlFor="preview" className="text-[1.0625rem] font-bold tracking-tight text-stone-900">
                  Message preview
                </label>
              </div>
              <div className="mt-3 rounded-2xl bg-[#efe9df] p-3 ring-1 ring-inset ring-stone-200">
                <textarea
                  id="preview"
                  readOnly
                  value={msg}
                  rows={13}
                  className="block w-full resize-none rounded-2xl rounded-tr-md bg-[#dcf5e3] px-3.5 py-3 text-[0.8125rem] leading-relaxed text-stone-900 shadow-[var(--shadow-xs)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:flex">
                <LinkButton variant="whatsapp" size="lg" icon="whatsapp" href={waLink(chosen.whatsapp!, msg)} target="_blank" rel="noreferrer" className="flex-1">
                  Open WhatsApp
                </LinkButton>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={copied ? 'check' : 'copy'}
                  onClick={() => {
                    navigator.clipboard?.writeText(msg).then(
                      () => {
                        setCopied(true)
                        toast('Message copied')
                        setTimeout(() => setCopied(false), 2000)
                      },
                      () => {
                        setCopied(false)
                        toast('Could not copy on this browser', 'alert')
                      },
                    )
                  }}
                >
                  {copied ? 'Copied' : 'Copy text'}
                </Button>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-600">
                <Icon name="shield" size={14} className="text-brand-600" />
                WhatsApp opens with this message ready. You review it and press Send yourself.
              </p>
              <div className="mt-5 border-t border-stone-100 pt-4">
                {done ? (
                  <p className="flex items-center gap-2 text-sm font-semibold text-brand-800" role="status">
                    <Icon name="checkCircle" size={18} /> Logged to your impact. Well done!
                  </p>
                ) : (
                  <Button
                    variant="ghost"
                    icon="checkCircle"
                    onClick={() => {
                      onHandedOver(chosen.id)
                      setDone(true)
                      toast('Logged to your impact. Well done!', 'leaf')
                    }}
                  >
                    Handed over? Log it to my impact
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="hidden lg:block">
              <EmptyState icon="whatsapp" title="Pick a collector" body="Choose a collector on the left to fill in your details and preview the WhatsApp message." />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
