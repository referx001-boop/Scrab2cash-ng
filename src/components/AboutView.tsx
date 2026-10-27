import { SOURCES } from '../data/sources'
import { MATERIALS, co2SavedPerKg } from '../data/materials'
import { priceBand, naira } from '../lib/estimate'
import { Card, SectionHeader } from './ui'
import { Icon, MaterialIcon, type IconName } from './icons'

const PILLARS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'offline', title: 'Offline-first', body: 'Works with no data after the first visit.' },
  { icon: 'shield', title: 'Private', body: 'No account, no server, no tracking.' },
  { icon: 'book', title: 'Transparent', body: 'Every price links to its source.' },
]

export function AboutView() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Card>
        <SectionHeader icon="info" title="About Scrap2Cash NG" />
        <p className="mt-3 text-sm leading-relaxed text-stone-700">
          A free, offline-first tool that helps Nigerian households and small shops sort recyclables, see what they are worth, and reach a real collector on WhatsApp. No account, no server, no
          tracking: everything stays on your phone.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <li key={p.title} className="flex gap-3 rounded-2xl bg-stone-50 p-3 ring-1 ring-inset ring-stone-200/70">
              <span aria-hidden className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-[var(--shadow-xs)] ring-1 ring-stone-200">
                <Icon name={p.icon} size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-stone-900">{p.title}</span>
                <span className="block text-xs text-stone-600">{p.body}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-200">
          <Icon name="alert" size={18} className="mt-px" />
          <span>
            <strong>All prices are estimates.</strong> They come from published buyer price lists and news reports (2025–2026) and change with the market. Collectors weigh, inspect and set the final
            price.
          </span>
        </p>
      </Card>

      <Card>
        <SectionHeader icon="table" title="Full price & carbon table" subtitle="₦ per kg for small household quantities." />
        <div className="-mx-4 mt-4 overflow-x-auto sm:-mx-5">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Estimated naira per kg and CO2e saved per kg</caption>
            <thead>
              <tr className="border-y border-stone-200 bg-stone-50 text-xs font-semibold text-stone-600">
                <th scope="col" className="py-2.5 pr-2 pl-4 sm:pl-5">
                  Material
                </th>
                <th scope="col" className="hidden py-2.5 pr-2 sm:table-cell">
                  ₦/kg (low–high)
                </th>
                <th scope="col" className="py-2.5 pr-2 text-right">
                  Typical
                  <span className="block font-normal sm:hidden">₦/kg (low–high)</span>
                </th>
                <th scope="col" className="py-2.5 pr-4 text-right sm:pr-5">
                  kg CO₂e
                  <span className="block font-normal">saved/kg</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {MATERIALS.map((m) => {
                const b = priceBand(m)
                const range = b.hasPrice ? `${naira(b.low)}–${naira(b.high)}` : 'on inspection'
                return (
                  <tr key={m.id} className="transition-colors hover:bg-stone-50">
                    <td className="py-2.5 pr-2 pl-4 sm:pl-5">
                      <span className="flex items-center gap-2.5">
                        <MaterialIcon id={m.id} bin={m.bin} size="sm" />
                        <span className="leading-snug font-medium text-stone-900">{m.name}</span>
                      </span>
                    </td>
                    <td className="tabular hidden py-2.5 pr-2 whitespace-nowrap text-stone-700 sm:table-cell">{range}</td>
                    <td className="tabular py-2.5 pr-2 text-right whitespace-nowrap">
                      <span className="block font-bold text-brand-800">{b.hasPrice ? naira(b.typical) : '-'}</span>
                      <span className="block text-xs text-stone-600 sm:hidden">{range}</span>
                    </td>
                    <td className="tabular py-2.5 pr-4 text-right text-stone-700 sm:pr-5">{co2SavedPerKg(m).toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionHeader icon="book" title="Sources" subtitle="Every number in the app traces back to one of these." />
        <ul className="mt-4 divide-y divide-stone-100">
          {SOURCES.map((s) => (
            <li key={s.id} className="py-3 first:pt-0 last:pb-0">
              <a className="group inline-flex items-start gap-1.5 font-semibold text-brand-700 hover:text-brand-900" href={s.url} target="_blank" rel="noreferrer">
                <span className="underline decoration-brand-300 underline-offset-2 group-hover:decoration-brand-700">{s.title}</span>
                <Icon name="external" size={14} className="mt-1" />
              </a>
              <span className="ml-1 text-sm text-stone-500">({s.date})</span>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">{s.note}</p>
            </li>
          ))}
        </ul>
      </Card>
      <p className="flex items-center justify-center gap-2 px-1 pb-4 text-center text-xs text-stone-500">Built for Arbiter Hacks V1 · “Rethinking Waste” · Made in Port Harcourt 🇳🇬</p>
    </div>
  )
}
