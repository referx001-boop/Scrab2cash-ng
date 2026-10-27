import { useState } from 'react'
import { ask, EXAMPLES, type AssistantAnswer } from '../lib/assistant'
import { BINS } from '../data/materials'
import type { CartItem } from '../lib/estimate'
import { Button, Card, EmptyState, SectionHeader, inputCls, useToast } from './ui'
import { BinBadge } from './EstimateView'
import { Icon, MaterialIcon } from './icons'

interface Props {
  cart: CartItem[]
  setCart: (c: CartItem[]) => void
}

export function AskView({ cart, setCart }: Props) {
  const toast = useToast()
  const [q, setQ] = useState('')
  const [answers, setAnswers] = useState<(AssistantAnswer & { key: number })[]>([])
  const [added, setAdded] = useState<string[]>([])

  const run = (text: string) => {
    const t = text.trim()
    if (!t) return
    setAnswers((a) => [{ ...ask(t), key: Date.now() + Math.random() }, ...a].slice(0, 8))
    setQ('')
  }

  const addToBag = (a: AssistantAnswer) => {
    if (!a.material || !a.kg) return
    const id = a.material.id
    const ex = cart.find((c) => c.materialId === id)
    setCart(ex ? cart.map((c) => (c.materialId === id ? { ...c, kg: +(c.kg + a.kg!).toFixed(3) } : c)) : [...cart, { materialId: id, kg: +a.kg.toFixed(3) }])
    setAdded((x) => [...x, a.query])
    toast(`Added ${a.material.short} to your bag`, 'bag')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card>
        <SectionHeader icon="chat" title="What bin? What value?" subtitle="Type any item. Works offline: no internet or AI service needed." />
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            run(q)
          }}
        >
          <label htmlFor="ask" className="sr-only">
            Item
          </label>
          <div className="relative flex-1">
            <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-stone-400" />
            <input id="ask" className={`${inputCls} pl-10`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. 30 pure water bottles" autoComplete="off" enterKeyHint="send" />
          </div>
          <Button type="submit" size="lg" icon="send" aria-label="Ask" disabled={!q.trim()} className="px-4">
            <span className="max-sm:sr-only">Ask</span>
          </Button>
        </form>
        <p className="mt-4 text-xs font-semibold tracking-wide text-stone-500 uppercase">Try</p>
        <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => run(ex)}
              className="min-h-10 shrink-0 rounded-full bg-white px-3.5 text-sm font-medium text-stone-700 ring-1 ring-stone-200 transition-[background-color,transform,box-shadow] duration-150 hover:bg-brand-50 hover:text-brand-800 hover:ring-brand-200 active:scale-95"
            >
              {ex}
            </button>
          ))}
        </div>
      </Card>

      {answers.length === 0 && (
        <Card>
          <EmptyState icon="recycle" title="Ask about any item" body="Tell me what you have, like “old phone charger” or “3kg cans”. I’ll tell you which bag it goes in and what it’s worth." />
        </Card>
      )}

      <div aria-live="polite" className="space-y-4">
        {answers.map((a) => {
          const bin = BINS[a.bin]
          const isAdded = added.includes(a.query)
          return (
            <div key={a.key} className="animate-pop space-y-2">
              <div className="flex justify-end">
                <p className="max-w-[80%] rounded-2xl rounded-br-md bg-brand-700 px-3.5 py-2 text-sm font-medium text-white shadow-[var(--shadow-brand)]">“{a.query}”</p>
              </div>
              <Card className="rounded-tl-md">
                <div className="flex items-start gap-3">
                  <MaterialIcon id={a.material?.id} bin={a.matched ? a.bin : 'general'} />
                  <div className="min-w-0 flex-1">
                    <h3 className="leading-snug font-bold text-stone-900">{a.title}</h3>
                    <div className="mt-1.5">
                      {a.matched ? (
                        <BinBadge bin={a.bin} label={a.binLabel} />
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700 ring-1 ring-inset ring-stone-300">{a.binLabel}</span>
                      )}
                    </div>
                  </div>
                </div>
                {a.matched && <p className="mt-3 text-xs text-stone-600">{bin.hint}</p>}
                {a.valueText && (
                  <p className="tabular mt-3 flex gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-900 ring-1 ring-inset ring-brand-100">
                    <Icon name="wallet" size={17} className="mt-px text-brand-600" />
                    <span>{a.valueText}</span>
                  </p>
                )}
                {a.note && <p className="mt-3 text-sm leading-relaxed text-stone-700">{a.note}</p>}
                {a.tips.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-sm text-stone-700">
                    {a.tips.map((t) => (
                      <li key={t} className="flex gap-2">
                        <Icon name="check" size={16} strokeWidth={2.4} className="mt-0.5 text-brand-600" />
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                {a.material && a.kg && a.material.quotes.length > 0 && (
                  <Button variant={isAdded ? 'ghost' : 'secondary'} icon={isAdded ? 'check' : 'plus'} className="mt-4" onClick={() => addToBag(a)} disabled={isAdded}>
                    {isAdded ? 'Added' : 'Add to my bag'}
                  </Button>
                )}
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
