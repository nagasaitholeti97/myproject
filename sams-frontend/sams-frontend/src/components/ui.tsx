import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { initials, level, MIN, pctTxt, type Tone } from '../lib'
import { useStore } from '../store'

type ToneKey = Tone | 'accent' | 'event'

export const chipTone: Record<ToneKey, string> = {
  ok: 'bg-ok/15 text-ok',
  warn: 'bg-warn/15 text-warn',
  bad: 'bg-bad/15 text-bad',
  none: 'bg-surface2 text-mut',
  accent: 'bg-accent/15 text-accent',
  event: 'bg-event/15 text-event',
}
export const strokeTone: Record<Tone, string> = { ok: 'stroke-ok', warn: 'stroke-warn', bad: 'stroke-bad', none: 'stroke-mut' }
export const fillTone: Record<Tone, string> = { ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', none: 'bg-mut' }
export const textTone: Record<Tone, string> = { ok: 'text-ok', warn: 'text-warn', bad: 'text-bad', none: 'text-mut' }

export function Chip({ tone = 'none', children, className = '' }: { tone?: ToneKey; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${chipTone[tone]} ${className}`}>
      {children}
    </span>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'light'; size?: 'sm' | 'md' | 'lg' }

export function Btn({ variant = 'primary', size = 'md', className = '', type = 'button', ...rest }: BtnProps) {
  const v = {
    primary: 'border-accent bg-accent text-accentink hover:brightness-110',
    ghost: 'border-line bg-transparent text-ink hover:bg-surface2',
    light: 'border-white/45 bg-white/20 text-inherit hover:bg-white/30',
  }[variant]
  const s = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', lg: 'w-full rounded-xl px-4 py-3 text-base' }[size]
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${v} ${s} ${className}`}
      {...rest}
    />
  )
}

const inputCls =
  'w-full min-w-0 rounded-lg border border-line bg-surface px-3 py-2.5 text-ink focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-accent disabled:bg-surface2 disabled:text-mut'

export function Field({ label, id, className = '', ...rest }: { label: string; id: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`grid min-w-0 gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-[0.82rem] font-semibold text-mut">{label}</label>
      <input id={id} name={id} className={inputCls} {...rest} />
    </div>
  )
}

export function SelectField({
  label, id, options, className = '', ...rest
}: { label: string; id: string; options: (string | [string, string])[]; className?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`grid min-w-0 gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-[0.82rem] font-semibold text-mut">{label}</label>
      <select id={id} name={id} className={inputCls} {...rest}>
        {options.map((o) => {
          const [v, l] = Array.isArray(o) ? o : [o, o]
          return <option key={v} value={v}>{l}</option>
        })}
      </select>
    </div>
  )
}

/** Segmented control. Use `fill` to stretch it across its container. */
export function Seg<T extends string>({
  value, options, onChange, label, fill = false,
}: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string; fill?: boolean }) {
  return (
    <div role="tablist" aria-label={label} className={`max-w-full gap-0.5 overflow-x-auto rounded-xl border border-line bg-surface2 p-1 ${fill ? 'flex w-full bg-surface' : 'inline-flex'}`}>
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={`cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-accent ${fill ? 'flex-1' : ''} ${
            value === v ? (fill ? 'bg-accent text-accentink' : 'bg-surface text-ink shadow-sm') : 'text-mut hover:text-ink'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-2xl border border-line bg-surface/90 p-5 shadow-sm ${className}`}>{children}</div>
}

export function Msg({ tone, children }: { tone: 'ok' | 'bad' | 'warn' | 'none'; children: ReactNode }) {
  return <div role={tone === 'bad' ? 'alert' : 'status'} className={`rounded-lg px-3 py-2.5 text-sm ${chipTone[tone]}`}>{children}</div>
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 font-head text-[1.05rem] font-semibold">
      <span className="size-2.5 rounded-[3px] bg-accent" aria-hidden="true" />
      {children}
    </h3>
  )
}

export function KV({ rows }: { rows: [string, string | number | null | undefined][] }) {
  return (
    <dl className="mt-3 grid grid-cols-[minmax(90px,38%)_1fr] gap-x-3 gap-y-2">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-[0.86rem] text-mut">{k}</dt>
          <dd className="m-0 break-words font-medium">{v === '' || v == null ? '—' : v}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Circular percentage indicator. */
export function Ring({ pct, size = 76, stroke = 8 }: { pct: number | null; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const tone = level(pct).tone
  const mid = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label={`Attendance ${pctTxt(pct)}`}>
      <circle cx={mid} cy={mid} r={r} fill="none" strokeWidth={stroke} className="stroke-surface2" />
      <circle
        cx={mid} cy={mid} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${(c * (pct ?? 0)) / 100} ${c}`} transform={`rotate(-90 ${mid} ${mid})`} className={strokeTone[tone]}
      />
      <text x={mid} y={mid + size * 0.07} textAnchor="middle" className="fill-ink font-head font-bold" style={{ fontSize: size * 0.2 }}>
        {pct == null ? '–' : Math.round(pct) + '%'}
      </text>
    </svg>
  )
}

/** Progress bar with a tick at the minimum percentage. */
export function Bar({ pct }: { pct: number | null }) {
  const tone = level(pct).tone
  return (
    <div className="relative h-1.5 min-w-20 rounded-full bg-surface2" role="presentation">
      <div className={`absolute inset-y-0 left-0 rounded-full ${fillTone[tone]}`} style={{ width: `${pct ?? 0}%` }} />
      <div className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-mut opacity-70" style={{ left: `${MIN}%` }} title={`${MIN}% minimum`} />
    </div>
  )
}

export function Hero({ kind, name, chips }: { kind: 'Student' | 'Faculty'; name: string; chips: string[] }) {
  const { logout } = useStore()
  return (
    <div className={`relative overflow-hidden rounded-[22px] bg-linear-to-br from-accent text-accentink ${kind === 'Student' ? 'to-event' : 'to-teal'}`}>
      <div className="pointer-events-none absolute -top-28 -right-16 size-64 rounded-full bg-white/15" />
      <div className="pointer-events-none absolute right-36 -bottom-24 size-40 rounded-full bg-white/10" />
      <div className="relative flex flex-wrap items-center gap-4 p-6">
        <div className="grid size-[68px] place-items-center rounded-full border-2 border-white/50 bg-white/25 font-head text-2xl font-bold" aria-hidden="true">
          {initials(name)}
        </div>
        <div className="mr-auto grid min-w-0 gap-1.5">
          <span className="text-xs font-bold tracking-[0.12em] uppercase opacity-85">{kind} portal</span>
          <h2 className="font-head text-[1.7rem] leading-tight font-semibold text-balance">{name}</h2>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c} className="rounded-full bg-white/20 px-3 py-0.5 text-[0.82rem] font-semibold">{c}</span>
            ))}
          </div>
        </div>
        <Btn variant="light" size="sm" onClick={logout}>Sign out</Btn>
      </div>
    </div>
  )
}

export function BackBtn() {
  const { back, canGoBack } = useStore()
  return (
    <Btn variant="ghost" size="sm" onClick={back} className="mb-3">
      ‹ {canGoBack ? 'Back' : 'Back to sign in'}
    </Btn>
  )
}

export function Tabs({ tabs, active, onChange }: { tabs: [string, string][]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="my-4">
      <Seg fill label="Sections" value={active} options={tabs} onChange={onChange} />
    </div>
  )
}

export function Toast() {
  const { toastMsg } = useStore()
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-4 left-1/2 z-50 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg transition-all duration-200 ${
        toastMsg ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      {toastMsg}
    </div>
  )
}
