import { useEffect, useState } from 'react'
import type { City } from './data/collectors'
import { COLLECTORS } from './data/collectors'
import { materialById } from './data/materials'
import { load, save, KEYS } from './lib/storage'
import { priceBand, naira, estimateCart, type CartItem } from './lib/estimate'
import { EstimateView } from './components/EstimateView'
import { CollectorsView } from './components/CollectorsView'
import { PickupView } from './components/PickupView'
import { ImpactView, totals, type LogEntry } from './components/ImpactView'
import { AskView } from './components/AskView'
import { AboutView } from './components/AboutView'
import { Icon, Logo, type IconName } from './components/icons'
import { AnimatedNumber, ToastProvider } from './components/ui'

type Tab = 'estimate' | 'collectors' | 'pickup' | 'impact' | 'ask' | 'about'
const TABS: { id: Exclude<Tab, 'about'>; label: string; icon: IconName }[] = [
  { id: 'estimate', label: 'Estimate', icon: 'scale' },
  { id: 'collectors', label: 'Collectors', icon: 'pin' },
  { id: 'pickup', label: 'Pickup', icon: 'truck' },
  { id: 'impact', label: 'Impact', icon: 'leaf' },
  { id: 'ask', label: 'Assistant', icon: 'chat' },
]
const ALL: Tab[] = ['estimate', 'collectors', 'pickup', 'impact', 'ask', 'about']

const tabFromHash = (): Tab => {
  const h = location.hash.replace('#/', '') as Tab
  return ALL.includes(h) ? h : 'estimate'
}

export default function App() {
  const [tab, setTabState] = useState<Tab>(tabFromHash)
  const [cart, setCartState] = useState<CartItem[]>(() => load(KEYS.cart, []))
  const [log, setLogState] = useState<LogEntry[]>(() => load(KEYS.log, []))
  const [city, setCityState] = useState<City>(() => load(KEYS.city, 'Port Harcourt' as City))
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setTabState(tabFromHash())
    const sc = () => setScrolled(window.scrollY > 4)
    window.addEventListener('hashchange', on)
    window.addEventListener('scroll', sc, { passive: true })
    return () => {
      window.removeEventListener('hashchange', on)
      window.removeEventListener('scroll', sc)
    }
  }, [])

  const setTab = (t: Tab) => {
    if (location.hash !== '#/' + t) location.hash = '/' + t
    setTabState(t)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }
  const setCart = (c: CartItem[]) => (setCartState(c), save(KEYS.cart, c))
  const setLog = (l: LogEntry[]) => (setLogState(l), save(KEYS.log, l))
  const setCity = (c: City) => (setCityState(c), save(KEYS.city, c))

  const handedOver = (collectorId: string) => {
    const col = COLLECTORS.find((c) => c.id === collectorId)
    const now = new Date().toISOString()
    const items = cart.filter((i) => !col || col.accepts.includes(i.materialId))
    const entries: LogEntry[] = items.map((i, n) => ({
      id: Date.now().toString(36) + n,
      date: now,
      materialId: i.materialId,
      kg: i.kg,
      naira: priceBand(materialById(i.materialId)!).typical * i.kg,
      estimated: true,
      collectorId,
    }))
    setLog([...entries, ...log])
    setCart(cart.filter((i) => !items.includes(i)))
  }

  const bag = estimateCart(cart)
  const t = totals(log)
  const activeIdx = TABS.findIndex((x) => x.id === tab)

  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3 focus:shadow-lg">
          Skip to content
        </a>

        {/* ---------- Top bar ---------- */}
        <header
          className={`sticky top-0 z-30 border-b bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 transition-[border-color,box-shadow] duration-200 ${
            scrolled ? 'border-stone-200 shadow-[0_1px_12px_-4px_rgb(28_25_23/0.12)]' : 'border-transparent'
          }`}
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <button onClick={() => setTab('estimate')} className="-ml-1 flex min-h-11 items-center gap-2.5 rounded-xl px-1 text-left" aria-label="Scrap2Cash NG home">
              <Logo size={36} />
              <span className="leading-tight">
                <span className="flex items-center gap-1.5 text-[1.05rem] font-extrabold tracking-tight whitespace-nowrap text-stone-900">
                  Scrap2Cash
                  <span className="rounded-md bg-brand-700 px-1.5 py-px text-[0.65rem] font-bold tracking-wider text-white">NG</span>
                </span>
                <span className="block text-xs whitespace-nowrap text-stone-500">Turn waste into naira</span>
              </span>
            </button>

            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-1 rounded-2xl bg-stone-100/80 p-1 ring-1 ring-stone-200">
                {TABS.map((x) => (
                  <li key={x.id}>
                    <button
                      onClick={() => setTab(x.id)}
                      aria-current={tab === x.id ? 'page' : undefined}
                      className={`flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-all duration-200 ${
                        tab === x.id ? 'bg-white text-brand-800 shadow-[var(--shadow-card)]' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Icon name={x.icon} size={17} />
                      {x.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-1.5">
              {cart.length > 0 && tab !== 'estimate' && (
                <button
                  onClick={() => setTab('estimate')}
                  className="flex min-h-11 animate-pop items-center gap-2 rounded-xl bg-brand-50 px-3 text-sm font-bold whitespace-nowrap text-brand-800 ring-1 ring-brand-200 transition-transform active:scale-95"
                  aria-label={`Bag, estimated ${naira(bag.typical)}`}
                >
                  <Icon name="bag" size={17} />
                  <AnimatedNumber value={bag.typical} format={naira} />
                </button>
              )}
              <button
                onClick={() => setTab('about')}
                aria-label="About and sources"
                aria-current={tab === 'about' ? 'page' : undefined}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${tab === 'about' ? 'bg-brand-50 text-brand-800' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                <Icon name="info" size={21} />
              </button>
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-32 sm:px-6 lg:pt-8 lg:pb-16">
          <div key={tab} className="animate-view">
            {tab === 'estimate' && <EstimateView cart={cart} setCart={setCart} goPickup={() => setTab('pickup')} goCollectors={() => setTab('collectors')} impactKg={t.kg} impactCo2={t.co2} />}
            {tab === 'ask' && <AskView cart={cart} setCart={setCart} />}
            {tab === 'collectors' && <CollectorsView city={city} setCity={setCity} />}
            {tab === 'pickup' && <PickupView cart={cart} city={city} setCity={setCity} goEstimate={() => setTab('estimate')} onHandedOver={handedOver} />}
            {tab === 'impact' && <ImpactView log={log} setLog={setLog} />}
            {tab === 'about' && <AboutView />}
          </div>
        </main>

        {/* ---------- Bottom tab bar (mobile / tablet) ---------- */}
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 lg:hidden">
          <ul className="relative mx-auto grid max-w-2xl grid-cols-5 px-1">
            {activeIdx >= 0 && (
              <span
                aria-hidden
                className="absolute top-0 left-1 h-[3px] rounded-b-full transition-transform duration-300 ease-[var(--ease-out-soft)]"
                style={{ width: 'calc((100% - 0.5rem) / 5)', transform: `translateX(${activeIdx * 100}%)` }}
              >
                <span className="mx-auto block h-full w-8 rounded-b-full bg-brand-600" />
              </span>
            )}
            {TABS.map((x) => {
              const on = tab === x.id
              return (
                <li key={x.id}>
                  <button
                    onClick={() => setTab(x.id)}
                    aria-current={on ? 'page' : undefined}
                    className={`group flex min-h-16 w-full flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold transition-colors duration-200 ${on ? 'text-brand-800' : 'text-stone-500 hover:text-stone-800'}`}
                  >
                    <span
                      className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-all duration-300 ease-[var(--ease-out-soft)] group-active:scale-90 ${on ? 'bg-brand-50' : ''}`}
                    >
                      <Icon name={x.icon} size={22} strokeWidth={on ? 2.1 : 1.8} />
                      {x.id === 'pickup' && cart.length > 0 && (
                        <span
                          aria-hidden
                          className="absolute -top-0.5 right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-400 px-1 text-[0.6rem] font-bold text-brand-950 ring-2 ring-white"
                        >
                          {cart.length}
                        </span>
                      )}
                    </span>
                    {x.label}
                    {x.id === 'pickup' && cart.length > 0 && <span className="sr-only"> ({cart.length} items in bag)</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </ToastProvider>
  )
}
