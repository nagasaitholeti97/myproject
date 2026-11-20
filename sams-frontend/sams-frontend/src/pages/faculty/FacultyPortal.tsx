import { useState, type FormEvent } from 'react'
import { emailRe, level, MIN, pctTxt, subStat } from '../../lib'
import { useStore } from '../../store'
import type { Faculty } from '../../types'
import { BackBtn, Btn, Card, CardTitle, Chip, Field, Hero, KV, Msg, Ring, Tabs } from '../../components/ui'
import { PasswordCard } from '../../components/PasswordModal'
import ClassDetail from './ClassDetail'

export default function FacultyPortal() {
  const { session, faculty, subjects, view, go } = useStore()
  const f = faculty.find((x) => x.faculty_id === session?.id)
  if (!f) return null
  const sub = subjects.find((x) => x.subject_id === f.subject_id)
  if (!sub) return null

  return (
    <>
      <BackBtn />
      <Hero kind="Faculty" name={f.name} chips={[f.faculty_id, f.designation, sub.subject_name]} />
      <Tabs
        active={view.tab}
        onChange={(t) => t !== view.tab && go({ tab: t })}
        tabs={[['profile', 'Profile'], ['classes', 'Classes attending']]}
      />
      {view.tab === 'classes' ? (view.classId ? <ClassDetail f={f} /> : <ClassList f={f} />) : <FacultyProfile f={f} />}
    </>
  )
}

function FacultyProfile({ f }: { f: Faculty }) {
  const { view, go, back, updateFaculty, toast, subjects } = useStore()
  const [err, setErr] = useState('')
  const sub = subjects.find((x) => x.subject_id === f.subject_id)!

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    if (!/^\d{10}$/.test(d.phone.trim())) return setErr('Phone must be 10 digits.')
    if (!emailRe.test(d.email.trim())) return setErr('Enter a valid email address.')
    const m = await updateFaculty({ phone: d.phone.trim(), email: d.email.trim() })
    if (m) return setErr(m)
    setErr('')
    toast('Details saved.')
    back()
  }

  if (view.edit) {
    return (
      <Card>
        <form onSubmit={save} noValidate className="grid gap-4">
          <CardTitle>Edit contact details</CardTitle>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field id="phone" label="Phone" required defaultValue={f.phone} />
            <Field id="email" label="Email" type="email" required defaultValue={f.email} />
          </div>
          {err && <Msg tone="bad">{err}</Msg>}
          <div className="flex gap-2.5">
            <Btn type="submit">Save</Btn>
            <Btn variant="ghost" onClick={back}>Cancel</Btn>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Btn variant="ghost" size="sm" onClick={() => go({ ...view, edit: true })}>Edit contact</Btn>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>Personal</CardTitle>
          <KV rows={[['Name', f.name], ['Gender', f.gender], ['Age', f.age ? `${f.age} years` : ''], ['Email', f.email], ['Phone', f.phone]]} />
        </Card>
        <Card>
          <CardTitle>Professional</CardTitle>
          <KV
            rows={[
              ['Faculty ID', f.faculty_id], ['Designation', f.designation], ['Qualification', f.qualification],
              ['Experience', `${f.experience} years`], ['Department', f.department], ['Subject', `${sub.subject_name} (${sub.subject_code})`],
            ]}
          />
        </Card>
      </div>
      <PasswordCard />
    </>
  )
}

const headerGradient = [
  'from-accent to-teal',
  'from-accent to-[#0e7490]',
  'from-accent to-[#0f766e]',
]

function ClassList({ f }: { f: Faculty }) {
  const { students, records, go, sections, subjects } = useStore()
  const sub = subjects.find((x) => x.subject_id === f.subject_id)!
  const years = ['1st year', '2nd year', '3rd year']

  return (
    <>
      <p className="mb-3.5 text-mut">You teach <b>{sub.subject_name}</b>. Open a class to take attendance or see its students.</p>
      <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))]">
        {sections.map((sec, i) => {
          const list = students.filter((s) => s.section_id === sec.section_id)
          let held = 0
          let att = 0
          let low = 0
          for (const s of list) {
            const st = subStat(records, s.student_id, sub.subject_id)
            held += st.held
            att += st.attended
            if (st.pct != null && st.pct < MIN) low++
          }
          const pct = held ? (att / held) * 100 : null
          const lv = level(pct)
          return (
            <button
              key={sec.section_id}
              type="button"
              onClick={() => go({ tab: 'classes', classId: sec.section_id, classMode: 'mark' })}
              className="cursor-pointer overflow-hidden rounded-[18px] border border-line bg-surface/90 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg focus-visible:outline-2 focus-visible:outline-accent"
            >
              <div className={`grid gap-0.5 bg-linear-to-br p-[18px] text-accentink ${headerGradient[i % 3]}`}>
                <span className="text-xs font-bold tracking-widest uppercase">{years[i]}</span>
                <h3 className="font-head text-xl font-semibold">{sec.section_name}</h3>
                <span className="text-[0.85rem] opacity-90">{list.length} students</span>
              </div>
              <div className="flex items-center gap-3.5 px-[18px] pt-[18px] pb-2">
                <Ring pct={pct} />
                <div className="grid justify-items-start gap-1">
                  <b className="font-head text-lg">Class average</b>
                  <Chip tone={lv.tone}>{lv.label}</Chip>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-[18px] pt-2 pb-[18px]">
                <Chip tone={low ? 'bad' : 'ok'}>{low ? `${low} below ${MIN}%` : `All above ${MIN}%`}</Chip>
                <span className="font-semibold text-accent">Open class ›</span>
              </div>
              <span className="sr-only">{pctTxt(pct)}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}
