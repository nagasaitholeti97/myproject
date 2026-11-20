import { useMemo, useState } from 'react'
import { PERIODS, advice, fmt, level, MIN, statsFor, TODAY } from '../../lib'
import { useStore } from '../../store'
import type { Student } from '../../types'
import { Bar, Card, Chip, Msg, Ring, SelectField } from '../../components/ui'

export default function Attendance({ s }: { s: Student }) {
  const { records, events, subjects } = useStore()
  const [subject, setSubject] = useState('all')
  const [month, setMonth] = useState('all')

  const stats = useMemo(() => statsFor(records, subjects, s.student_id), [records, s.student_id])
  const mine = useMemo(() => records.filter((r) => r.student_id === s.student_id), [records, s.student_id])

  const held = stats.reduce((a, x) => a + x.held, 0)
  const attended = stats.reduce((a, x) => a + x.attended, 0)
  const overall = held ? (attended / held) * 100 : null
  const short = stats.filter((x) => x.pct != null && x.pct < MIN)
  const eligible = stats.filter((x) => x.held && (x.pct ?? 0) >= MIN).length
  const next = events.filter((e) => e.event_type !== 'Semester' && e.end_date >= TODAY).sort((a, b) => a.start_date.localeCompare(b.start_date))[0]

  const months = useMemo(() => [...new Set(mine.map((r) => r.attendance_date.slice(0, 7)))].sort().reverse(), [mine])
  const log = mine.filter((r) => (subject === 'all' || r.subject_id === subject) && (month === 'all' || r.attendance_date.startsWith(month)))
  const dates = [...new Set(log.map((r) => r.attendance_date))].sort().reverse()
  const cell = new Map(log.map((r) => [`${r.attendance_date}|${r.period}`, r]))

  return (
    <>
      <Card className="grid items-center gap-5 bg-linear-to-br from-accent/10 to-surface sm:grid-cols-[auto_1fr]">
        <div className="justify-self-center"><Ring pct={overall} size={132} stroke={12} /></div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
          <Stat value={`${attended} / ${held}`} label="classes attended" />
          <Stat value={String(short.length)} label={`subjects below ${MIN}%`} className={short.length ? 'text-bad' : 'text-ok'} />
          {next && <Stat value={fmt(next.start_date, { day: 'numeric', month: 'short' })} label={next.title} />}
        </div>
      </Card>

      {short.length > 0 && (
        <div className="mt-4">
          <Msg tone="bad">
            You are below {MIN}% in {short.map((x) => x.subject.subject_name).join(', ')}, so you are not eligible for the exam in{' '}
            {short.length > 1 ? 'those subjects' : 'that subject'} yet. The cards below show how many classes you need to attend in a row.
          </Msg>
        </div>
      )}

      <div className="mt-7 mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-head text-lg font-semibold">By subject</h3>
        <Chip tone={short.length ? 'bad' : 'ok'}>Exam eligible in {eligible} of {stats.length} subjects</Chip>
      </div>
      <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]">
        {stats.map((x) => {
          const lv = level(x.pct)
          const notEligible = x.held ? (x.pct ?? 0) < MIN : null
          return (
            <article key={x.subject.subject_id} className="grid min-w-0 gap-3.5 rounded-[18px] border border-line bg-surface/90 p-[18px]">
              <header className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <h4 className="font-head text-[1.02rem] font-semibold">{x.subject.subject_name}</h4>
                  <span className="text-[0.82rem] text-mut">{x.subject.subject_code}</span>
                </div>
                <Chip tone={lv.tone}>{lv.label}</Chip>
              </header>
              <div className="flex items-center gap-3.5">
                <Ring pct={x.pct} />
                <div className="grid gap-0.5">
                  <b className="font-head text-xl tabular-nums">{x.attended} of {x.held}</b>
                  <span className="text-[0.85rem] text-mut">classes attended</span>
                </div>
              </div>
              <Bar pct={x.pct} />
              <p className="text-[0.86rem] text-mut">{advice(x.held, x.attended, x.pct)}</p>
              {notEligible !== null && (
                <div className={`flex items-center gap-2 rounded-[10px] px-3 py-2 text-[0.88rem] font-semibold ${notEligible ? 'bg-bad/15 text-bad' : 'bg-ok/15 text-ok'}`}>
                  <b>{notEligible ? '✕' : '✓'}</b> {notEligible ? 'Not eligible for exam' : 'Eligible for exam'}
                </div>
              )}
            </article>
          )
        })}
      </div>

      <div className="mt-7 mb-3 flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-head text-lg font-semibold">Hourly record</h3>
        <div className="flex flex-wrap gap-2.5">
          <SelectField id="att-subject" label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="min-w-40"
            options={[['all', 'All subjects'], ...subjects.map((x): [string, string] => [x.subject_id, x.subject_name])]} />
          <SelectField id="att-month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)} className="min-w-40"
            options={[['all', 'All months'], ...months.map((m): [string, string] => [m, fmt(m + '-01', { month: 'long', year: 'numeric' })])]} />
        </div>
      </div>

      {dates.length ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface/90">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  <Th>Date</Th>
                  {PERIODS.map((p) => <Th key={p}>{p}</Th>)}
                </tr>
              </thead>
              <tbody>
                {dates.slice(0, 12).map((d) => (
                  <tr key={d}>
                    <td className="border-b border-line px-3.5 py-2 align-top font-semibold">{fmt(d, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                    {PERIODS.map((_, i) => {
                      const r = cell.get(`${d}|${i}`)
                      if (!r) return <td key={i} className="border-b border-line px-2.5 py-2 text-center text-mut">–</td>
                      const absent = r.attendance_status === 'Absent'
                      return (
                        <td key={i} className={`border-b border-line px-2.5 py-2 align-top ${absent ? 'bg-bad/15 text-bad inset-ring inset-ring-bad/35' : ''}`}>
                          <span className="mb-1.5 block text-[0.82rem] leading-tight">{subjects.find((x) => x.subject_id === r.subject_id)?.subject_name}</span>
                          <Chip tone={absent ? 'bad' : 'ok'}>{r.attendance_status}</Chip>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dates.length > 12 && <p className="mt-2 text-[0.85rem] text-mut">Showing the latest 12 days of {dates.length}.</p>}
        </>
      ) : (
        <Card className="text-mut">No classes recorded yet for this selection.</Card>
      )}
    </>
  )
}

function Stat({ value, label, className = '' }: { value: string; label: string; className?: string }) {
  return (
    <div className="grid gap-0.5">
      <b className={`font-head text-2xl tabular-nums ${className}`}>{value}</b>
      <span className="text-[0.85rem] text-mut">{label}</span>
    </div>
  )
}

function Th({ children }: { children: string }) {
  return <th className="whitespace-nowrap border-b border-line bg-surface2 px-3.5 py-2.5 text-left text-[0.74rem] font-semibold tracking-wider text-mut uppercase">{children}</th>
}
