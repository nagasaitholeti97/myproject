import { useState } from 'react'
import { useStore } from '../../store'
import { dayDiff, fmt, TODAY } from '../../lib'
import type { CalendarEvent, EventType } from '../../types'
import { Btn, Card } from '../../components/ui'

type Shown = Exclude<EventType, 'Semester'>

const TYPES: Record<Shown, { dot: string; chip: string; text: string; border: string }> = {
  Holiday: { dot: 'bg-ok', chip: 'bg-ok/15 text-ok', text: 'text-ok', border: 'border-l-ok' },
  Exam: { dot: 'bg-bad', chip: 'bg-bad/15 text-bad', text: 'text-bad', border: 'border-l-bad' },
  'Class Test': { dot: 'bg-warn', chip: 'bg-warn/15 text-warn', text: 'text-warn', border: 'border-l-warn' },
  Assignment: { dot: 'bg-accent', chip: 'bg-accent/15 text-accent', text: 'text-accent', border: 'border-l-accent' },
  Event: { dot: 'bg-event', chip: 'bg-event/15 text-event', text: 'text-event', border: 'border-l-event' },
}
const NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function relative(e: CalendarEvent): string {
  if (e.end_date < TODAY) return 'Past'
  if (e.start_date <= TODAY) return 'Today'
  const n = dayDiff(TODAY, e.start_date)
  return n === 1 ? 'Tomorrow' : `In ${n} days`
}

export default function CalendarView() {
  const { events, subjects } = useStore()
  const shown = events.filter((e): e is CalendarEvent & { event_type: Shown } => e.event_type !== 'Semester')
  const term = events.find((e) => e.event_type === 'Semester')
  const [ym, setYm] = useState({ y: 2026, m: 10 })
  const [hidden, setHidden] = useState<Partial<Record<Shown, boolean>>>({})

  const visible = shown.filter((e) => !hidden[e.event_type])
  const first = new Date(Date.UTC(ym.y, ym.m, 1))
  const lead = (first.getUTCDay() + 6) % 7
  const dim = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate()
  const total = Math.ceil((lead + dim) / 7) * 7
  const pad = (n: number) => String(n).padStart(2, '0')
  const f1 = `${ym.y}-${pad(ym.m + 1)}-01`
  const fl = `${ym.y}-${pad(ym.m + 1)}-${pad(dim)}`
  const list = visible.filter((e) => e.start_date <= fl && e.end_date >= f1).sort((a, b) => a.start_date.localeCompare(b.start_date))

  const step = (d: number) => setYm(({ y, m }) => {
    const n = y * 12 + m + d
    return { y: Math.floor(n / 12), m: n % 12 }
  })

  return (
    <>
      {term && (
        <p className="mb-3 text-[0.88rem] text-mut">
          {term.title} · {fmt(term.start_date, { day: 'numeric', month: 'short' })} to {fmt(term.end_date)} · Academic year {term.academic_year}
        </p>
      )}
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <h3 className="mr-auto min-w-0 font-head text-lg font-semibold">{fmt(f1, { month: 'long', year: 'numeric' })}</h3>
        <Btn variant="ghost" size="sm" aria-label="Previous month" onClick={() => step(-1)}>‹ Prev</Btn>
        <Btn variant="ghost" size="sm" onClick={() => setYm({ y: 2026, m: 10 })}>Today</Btn>
        <Btn variant="ghost" size="sm" aria-label="Next month" onClick={() => step(1)}>Next ›</Btn>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(TYPES) as Shown[]).map((t) => (
          <button
            key={t} type="button" aria-pressed={!hidden[t]} onClick={() => setHidden((h) => ({ ...h, [t]: !h[t] }))}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 py-0.5 text-[0.8rem] font-semibold ${hidden[t] ? 'line-through opacity-45' : ''}`}
          >
            <i className={`size-2.5 rounded-full ${TYPES[t].dot}`} />{t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-line bg-line">
        {NAMES.map((n) => (
          <div key={n} className="bg-surface2 p-1.5 text-center text-[0.72rem] font-semibold tracking-wider text-mut uppercase">{n}</div>
        ))}
        {Array.from({ length: total }, (_, i) => {
          const day = i - lead + 1
          if (day < 1 || day > dim) return <div key={i} className="min-h-[62px] bg-bg md:min-h-24" />
          const iso = `${ym.y}-${pad(ym.m + 1)}-${pad(day)}`
          const evs = visible.filter((e) => e.start_date <= iso && iso <= e.end_date)
          const weekend = i % 7 > 4
          return (
            <div key={i} className={`flex min-h-[62px] min-w-0 flex-col gap-1 p-1.5 md:min-h-24 ${weekend ? 'bg-surface2/60' : 'bg-surface'}`}>
              <span className={`grid size-6 place-items-center rounded-full text-[0.8rem] font-semibold tabular-nums ${iso === TODAY ? 'bg-accent text-accentink' : ''}`}>{day}</span>
              <div className="flex flex-wrap gap-0.5 md:hidden">
                {evs.slice(0, 4).map((e) => <i key={e.calendar_id} title={e.title} className={`size-[7px] rounded-full ${TYPES[e.event_type].dot}`} />)}
              </div>
              {evs.slice(0, 2).map((e) => (
                <span key={e.calendar_id} title={e.title} className={`hidden truncate rounded-[5px] px-1.5 py-px text-[0.72rem] font-semibold md:block ${TYPES[e.event_type].chip}`}>{e.title}</span>
              ))}
            </div>
          )
        })}
      </div>

      <div className="mt-4 grid gap-2">
        {list.length ? (
          list.map((e) => {
            const sub = subjects.find((x) => x.subject_id === e.subject_id)
            const same = e.start_date === e.end_date
            const rel = relative(e)
            return (
              <div key={e.calendar_id} className={`grid grid-cols-[1fr_auto] items-center gap-x-3.5 gap-y-1.5 rounded-[10px] border border-l-4 border-line bg-surface/90 px-3.5 py-3 sm:grid-cols-[130px_1fr_auto] ${TYPES[e.event_type].border}`}>
                <div className="col-span-full text-[0.85rem] text-mut tabular-nums sm:col-span-1 sm:text-inherit sm:font-normal">
                  {fmt(e.start_date, { day: 'numeric', month: 'short' })}{same ? '' : ' – ' + fmt(e.end_date, { day: 'numeric', month: 'short' })}
                </div>
                <div className="font-semibold">
                  {e.title}
                  <small className="block font-normal text-mut">{e.event_type}{sub ? ` · ${sub.subject_name}` : ''}</small>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${rel === 'Past' ? 'bg-surface2 text-mut' : TYPES[e.event_type].chip}`}>{rel}</span>
              </div>
            )
          })
        ) : (
          <Card className="text-mut">Nothing scheduled this month for the selected types.</Card>
        )}
      </div>
    </>
  )
}
