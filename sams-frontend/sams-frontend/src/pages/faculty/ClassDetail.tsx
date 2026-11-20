import { useEffect, useMemo, useState } from 'react'
import { fmt, level, MIN, pctTxt, subStat, TODAY, D } from '../../lib'
import { useStore, type ShortageAlert } from '../../store'
import type { Faculty, Status } from '../../types'
import { Btn, Card, Chip, Field, Msg, Seg } from '../../components/ui'

export default function ClassDetail({ f }: { f: Faculty }) {
  const { view, go, students, records, saveAttendance, toast, sections, subjects } = useStore()
  const sec = sections.find((s) => s.section_id === view.classId)!
  const sub = subjects.find((s) => s.subject_id === f.subject_id)!
  const list = useMemo(() => students.filter((s) => s.section_id === sec.section_id), [students, sec.section_id])
  const mode = view.classMode ?? 'mark'

  const [date, setDate] = useState(TODAY)
  const [marks, setMarks] = useState<Record<string, Status>>({})
  const [alerts, setAlerts] = useState<ShortageAlert[] | null>(null)

  // Load what is already saved for the chosen date (everyone defaults to Present).
  useEffect(() => {
    const m: Record<string, Status> = {}
    for (const s of list) {
      const r = records.find((x) => x.student_id === s.student_id && x.subject_id === sub.subject_id && x.attendance_date === date)
      m[s.student_id] = r ? r.attendance_status : 'Present'
    }
    setMarks(m)
    setAlerts(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, sec.section_id])

  const existing = records.some((r) => r.section_id === sec.section_id && r.subject_id === sub.subject_id && r.attendance_date === date)
  const weekend = [0, 6].includes(D(date).getUTCDay())
  const present = Object.values(marks).filter((v) => v === 'Present').length

  const setAll = (v: Status) => setMarks(Object.fromEntries(list.map((s) => [s.student_id, v])))

  const save = async () => {
    if (!date || date > TODAY) return toast('Choose a class date on or before today.')
    const result = await saveAttendance(sec.section_id, date, marks)
    if (!result) return
    setAlerts(result)
    toast(`Attendance saved for ${fmt(date)}.`)
  }

  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-head text-2xl font-semibold">{sec.section_name}</h2>
          <p className="text-mut">{sub.subject_name} · {list.length} students</p>
        </div>
        <Seg
          label="Class view" value={mode} onChange={(m) => go({ ...view, classMode: m })}
          options={[['mark', 'Attendance update'], ['list', 'Student list']]}
        />
      </div>

      {mode === 'list' ? (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface/90">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr>{['Student ID', 'Name', 'Phone', 'Held', 'Attended', 'Attendance', 'Status'].map((h, i) => (
                <th key={h} className={`border-b border-line bg-surface2 px-3.5 py-2.5 text-[0.74rem] font-semibold tracking-wider whitespace-nowrap text-mut uppercase ${i > 2 && i < 6 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const st = subStat(records, s.student_id, sub.subject_id)
                const lv = level(st.pct)
                return (
                  <tr key={s.student_id} className={lv.tone === 'bad' ? 'shadow-[inset_3px_0_0_var(--bad)]' : ''}>
                    <td className="border-b border-line px-3.5 py-2.5 tabular-nums">{s.student_id}</td>
                    <td className="border-b border-line px-3.5 py-2.5 font-semibold">{s.name}</td>
                    <td className="border-b border-line px-3.5 py-2.5 tabular-nums">{s.phone}</td>
                    <td className="border-b border-line px-3.5 py-2.5 text-right tabular-nums">{st.held}</td>
                    <td className="border-b border-line px-3.5 py-2.5 text-right tabular-nums">{st.attended}</td>
                    <td className="border-b border-line px-3.5 py-2.5 text-right font-semibold tabular-nums">{pctTxt(st.pct)}</td>
                    <td className="border-b border-line px-3.5 py-2.5"><Chip tone={lv.tone}>{lv.label}</Chip></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="mb-3.5 flex flex-wrap items-end gap-2.5">
            <Field id="date" label="Class date" type="date" max={TODAY} value={date} onChange={(e) => setDate(e.target.value || TODAY)} className="w-44" />
            <Btn variant="ghost" size="sm" onClick={() => setAll('Present')}>Mark all present</Btn>
            <Btn variant="ghost" size="sm" onClick={() => setAll('Absent')}>Mark all absent</Btn>
          </div>
          <div className="mb-3">
            <Msg tone={existing ? 'warn' : 'none'}>
              {existing ? 'Attendance for this date is already saved. Saving again replaces it.' : 'No attendance saved for this date yet.'}
              {weekend && ' This date is a weekend.'}
            </Msg>
          </div>
          <div className="overflow-hidden rounded-xl border border-line bg-surface/90">
            {list.map((s) => (
              <div key={s.student_id} className="grid grid-cols-[1fr_auto] items-center gap-2.5 border-b border-line px-3.5 py-2.5 last:border-b-0 hover:bg-surface2 sm:grid-cols-[110px_1fr_auto]">
                <span className="col-span-full font-mono text-[0.82rem] text-mut sm:col-span-1">{s.student_id}</span>
                <b>{s.name}</b>
                <div className="inline-flex gap-0.5 rounded-xl border border-line bg-surface2 p-1">
                  {(['Present', 'Absent'] as Status[]).map((v) => (
                    <button
                      key={v} type="button" aria-pressed={marks[s.student_id] === v}
                      onClick={() => setMarks((m) => ({ ...m, [s.student_id]: v }))}
                      className={`cursor-pointer rounded-lg px-3.5 py-1.5 font-semibold ${
                        marks[s.student_id] === v ? (v === 'Present' ? 'bg-ok text-accentink' : 'bg-bad text-accentink') : 'text-mut'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-mut">{present} present · {list.length - present} absent</span>
            <Btn onClick={save}>Save attendance</Btn>
          </div>
          {alerts && (
            <Card className="mt-5">
              <h3 className="font-head text-lg font-semibold">Shortage alerts queued</h3>
              {alerts.length ? (
                <>
                  <p className="mt-1.5 mb-2.5 text-[0.88rem] text-mut">
                    These students are now below {MIN}% in {sub.subject_name}. In the live system the Notifications module would email them. Nothing is sent from this demo.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {alerts.map((a) => <Chip key={a.name} tone="bad">{a.name} · {a.pct.toFixed(1)}%</Chip>)}
                  </div>
                </>
              ) : (
                <p className="mt-1.5 text-mut">Everyone in this class is at or above {MIN}%.</p>
              )}
            </Card>
          )}
        </>
      )}
    </>
  )
}
