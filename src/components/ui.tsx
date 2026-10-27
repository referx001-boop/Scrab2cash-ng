import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react'
import { Icon, type IconName } from './icons'

/* ---------------- Surfaces ---------------- */

export function Card({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)] ring-1 ring-stone-900/[0.06] sm:p-5 ${className}`}>
      {children}
    </section>
  )
}

export function H2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-[1.0625rem] leading-snug font-bold tracking-tight text-stone-900 ${className}`}>{children}</h2>
}

/** Card heading with optional step number, icon and right-hand slot */
export function SectionHeader({ step, icon, title, subtitle, right }: { step?: number; icon?: IconName; title: ReactNode; subtitle?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        {step !== undefined ? (
          <span aria-hidden className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
            {step}
          </span>
        ) : icon ? (
          <span aria-hidden className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
            <Icon name={icon} size={18} />
          </span>
        ) : null}
        <div className="min-w-0">
          <H2>{title}</H2>
          {subtitle && <p className="mt-0.5 text-sm text-stone-600">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

/* ---------------- Buttons ---------------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp' | 'danger' | 'light'
const styles: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white shadow-[var(--shadow-brand)] hover:bg-brand-800 active:bg-brand-900',
  secondary: 'bg-white text-stone-900 ring-1 ring-stone-300 shadow-[var(--shadow-xs)] hover:bg-stone-50 hover:ring-stone-400 active:bg-stone-100',
  ghost: 'text-brand-700 hover:bg-brand-50 active:bg-brand-100',
  whatsapp: 'bg-[#128a4a] text-white shadow-[0_6px_18px_-6px_rgb(18_138_74/0.6)] hover:bg-[#0f7840] active:bg-[#0c6635]',
  danger: 'text-rose-700 hover:bg-rose-50 active:bg-rose-100',
  light: 'bg-white text-brand-900 shadow-[var(--shadow-lift)] hover:bg-brand-50 active:bg-brand-100',
}
const sizes = { sm: 'min-h-11 px-3 text-sm', md: 'min-h-11 px-4 text-sm', lg: 'min-h-12 px-5 text-[0.95rem]' }
const base =
  'inline-flex select-none items-center justify-center gap-2 rounded-xl py-2 font-semibold whitespace-nowrap transition-[background-color,box-shadow,transform,color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none'

type BtnExtra = { variant?: Variant; size?: keyof typeof sizes; icon?: IconName; iconRight?: IconName }

function Inner({ icon, iconRight, children }: { icon?: IconName; iconRight?: IconName; children?: ReactNode }) {
  return (
    <>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </>
  )
}

export function Button({ variant = 'primary', size = 'md', icon, iconRight, className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & BtnExtra) {
  return (
    <button type="button" {...rest} className={`${base} ${sizes[size]} ${styles[variant]} ${className}`}>
      <Inner icon={icon} iconRight={iconRight}>
        {children}
      </Inner>
    </button>
  )
}

export function LinkButton({ variant = 'primary', size = 'md', icon, iconRight, className = '', children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & BtnExtra) {
  return (
    <a {...rest} className={`${base} ${sizes[size]} ${styles[variant]} ${className}`}>
      <Inner icon={icon} iconRight={iconRight}>
        {children}
      </Inner>
    </a>
  )
}

export function IconButton({ icon, label, className = '', tone = 'neutral', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string; tone?: 'neutral' | 'danger' }) {
  const t = tone === 'danger' ? 'text-stone-500 hover:bg-rose-50 hover:text-rose-700' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-[background-color,color,transform] duration-150 active:scale-90 ${t} ${className}`}
    >
      <Icon name={icon} size={18} />
    </button>
  )
}

/* ---------------- Badges ---------------- */

export function Badge({ children, tone = 'stone', icon }: { children: ReactNode; tone?: 'stone' | 'green' | 'amber' | 'sky'; icon?: IconName }) {
  const t = {
    stone: 'bg-stone-100 text-stone-700 ring-stone-200',
    green: 'bg-brand-50 text-brand-800 ring-brand-200',
    amber: 'bg-amber-50 text-amber-900 ring-amber-200',
    sky: 'bg-sky-50 text-sky-800 ring-sky-200',
  }[tone]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${t}`}>
      {icon && <Icon name={icon} size={13} strokeWidth={2.2} />}
      {children}
    </span>
  )
}

/* ---------------- Form controls ---------------- */

export function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-stone-700">
      {children}
    </label>
  )
}

export const inputCls =
  'block w-full min-h-12 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-base text-stone-900 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-150 placeholder:text-stone-500 hover:border-stone-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus-visible:outline-none'

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...rest} className={`${inputCls} appearance-none pr-10 ${className}`}>
        {children}
      </select>
      <Icon name="chevronDown" size={18} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-stone-500" />
    </div>
  )
}

/** Accessible segmented control (radio group). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className = '',
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
  label: string
  className?: string
}) {
  const idx = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const n = (idx + (e.key === 'ArrowRight' ? 1 : options.length - 1)) % options.length
    onChange(options[n].value)
    const btn = (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role=radio]')[n]
    btn?.focus()
  }
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
      className={`relative grid rounded-xl bg-stone-100 p-1 ring-1 ring-inset ring-stone-200 ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-lg bg-white shadow-[var(--shadow-card)] ring-1 ring-stone-900/5 transition-transform duration-300 ease-[var(--ease-out-soft)]"
        style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${idx * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          onClick={() => onChange(o.value)}
          className={`relative z-10 min-h-10 rounded-lg px-1 text-[0.8125rem] font-semibold whitespace-nowrap sm:px-2 sm:text-sm transition-colors duration-200 ${o.value === value ? 'text-brand-800' : 'text-stone-600 hover:text-stone-900'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Number input with − / + buttons. Keeps a free-typed text value. */
export function Stepper({
  id,
  value,
  onChange,
  step = 1,
  decimals = false,
  suffix,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & { id: string; value: string; onChange: (v: string) => void; step?: number; decimals?: boolean; suffix?: string }) {
  const n = parseFloat(value) || 0
  const set = (x: number) => onChange(x <= 0 ? '' : String(+x.toFixed(2)))
  return (
    <div className="flex min-h-12 items-stretch overflow-hidden rounded-xl border border-stone-300 bg-white shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-150 focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-500/15 hover:border-stone-400">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => set(n - step)}
        disabled={n <= 0}
        className="flex w-12 shrink-0 items-center justify-center text-stone-700 transition-colors hover:bg-stone-50 active:bg-stone-100 disabled:text-stone-300"
      >
        <Icon name="minus" size={18} strokeWidth={2.2} />
      </button>
      <div className="relative flex min-w-0 flex-1 items-center border-x border-stone-200">
        <input
          id={id}
          inputMode={decimals ? 'decimal' : 'numeric'}
          autoComplete="off"
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(decimals ? /[^\d.]/g : /\D/g, ''))}
          className={`tabular h-full w-full min-w-0 bg-transparent px-2 text-center text-lg font-semibold text-stone-900 placeholder:text-base placeholder:font-normal placeholder:text-stone-500 focus:outline-none focus-visible:outline-none ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && <span className="pointer-events-none absolute right-3 text-sm font-medium text-stone-500">{suffix}</span>}
      </div>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => set(n + step)}
        className="flex w-12 shrink-0 items-center justify-center text-brand-700 transition-colors hover:bg-brand-50 active:bg-brand-100"
      >
        <Icon name="plus" size={18} strokeWidth={2.2} />
      </button>
    </div>
  )
}

/* ---------------- Feedback ---------------- */

export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <span aria-hidden className="relative mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        <span className="absolute -inset-2 rounded-[1.4rem] border border-dashed border-brand-200" />
        <Icon name={icon} size={28} />
      </span>
      <p className="font-semibold text-stone-900">{title}</p>
      {body && <p className="mt-1 max-w-xs text-sm text-stone-600">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Notice({ tone = 'amber', icon = 'alert', children }: { tone?: 'amber' | 'green' | 'stone'; icon?: IconName; children: ReactNode }) {
  const t = { amber: 'bg-amber-50 text-amber-900 ring-amber-200', green: 'bg-brand-50 text-brand-900 ring-brand-200', stone: 'bg-stone-50 text-stone-700 ring-stone-200' }[tone]
  return (
    <div className={`flex gap-2.5 rounded-xl p-3 text-xs leading-relaxed ring-1 ring-inset ${t}`}>
      <Icon name={icon} size={16} className="mt-px" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

const reduceMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Smoothly tweens a number when it changes (ease-out, ~600ms). */
export function useAnimatedNumber(target: number, { duration = 600, fromZero = false } = {}) {
  const [v, setV] = useState(fromZero && !reduceMotion() ? 0 : target)
  const from = useRef(v)
  useEffect(() => {
    if (reduceMotion() || typeof requestAnimationFrame === 'undefined') {
      setV(target)
      from.current = target
      return
    }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const e = 1 - Math.pow(1 - p, 3)
      const x = a + (target - a) * e
      from.current = x
      setV(x)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return v
}

export function AnimatedNumber({ value, format, fromZero, className }: { value: number; format: (n: number) => string; fromZero?: boolean; className?: string }) {
  const v = useAnimatedNumber(value, { fromZero })
  return (
    <span className={`tabular ${className ?? ''}`}>
      <span aria-hidden>{format(v)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  )
}

/* ---------------- Toasts ---------------- */

type Toast = { id: number; text: string; icon: IconName }
const ToastCtx = createContext<(text: string, icon?: IconName) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((text: string, icon: IconName = 'checkCircle') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, text, icon }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-8">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex max-w-sm animate-toast items-center gap-2.5 rounded-2xl bg-stone-900/95 px-4 py-3 text-sm font-medium text-white shadow-[var(--shadow-float)] backdrop-blur"
          >
            <Icon name={t.icon} size={18} className="text-brand-300" />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
