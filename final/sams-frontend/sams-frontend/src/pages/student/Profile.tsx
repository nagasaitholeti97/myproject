import { useState, type FormEvent } from 'react'
import { ageOn, emailRe, fmt } from '../../lib'
import { useStore } from '../../store'
import type { Student } from '../../types'
import { Btn, Card, CardTitle, Field, KV, Msg } from '../../components/ui'
import { PasswordCard } from '../../components/PasswordModal'

export default function Profile({ s }: { s: Student }) {
  const { view, go, back, updateStudent, toast, sections } = useStore()
  const [err, setErr] = useState('')
  const sectionName = sections.find((x) => x.section_id === s.section_id)?.section_name ?? ''

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    const phone = f.phone.trim()
    const pin = f.pincode.trim()
    if (!/^\d{10}$/.test(phone)) return setErr('Phone must be 10 digits.')
    if (!emailRe.test(f.email.trim())) return setErr('Enter a valid email address.')
    if (pin && !/^\d{6}$/.test(pin)) return setErr('Pincode must be 6 digits.')
    const m = await updateStudent({
      phone, email: f.email.trim(), date_of_birth: f.date_of_birth, father_name: f.father_name.trim(), mother_name: f.mother_name.trim(),
      address: f.address.trim(), city: f.city.trim(), pincode: pin,
    })
    if (m) return setErr(m)
    setErr('')
    toast('Details saved.')
    back()
  }

  if (view.edit) {
    return (
      <Card>
        <form onSubmit={save} noValidate className="grid gap-4">
          <CardTitle>Edit details</CardTitle>
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <Field id="date_of_birth" label="Date of birth" type="date" max="2026-11-11" defaultValue={s.date_of_birth} />
            <Field id="father_name" label="Father" defaultValue={s.father_name} />
            <Field id="mother_name" label="Mother" defaultValue={s.mother_name} />
            <Field id="phone" label="Phone" required defaultValue={s.phone} />
            <Field id="email" label="Email" type="email" required defaultValue={s.email} />
            <Field id="address" label="Address" defaultValue={s.address} />
            <Field id="city" label="City" defaultValue={s.city} />
            <Field id="pincode" label="Pincode" defaultValue={s.pincode} />
          </div>
          <p className="text-[0.85rem] text-mut">Name, ID, class, department and course are set by the college office.</p>
          {err && <Msg tone="bad">{err}</Msg>}
          <div className="flex gap-2.5">
            <Btn type="submit">Save</Btn>
            <Btn variant="ghost" onClick={back}>Cancel</Btn>
          </div>
        </form>
      </Card>
    )
  }

  const age = ageOn(s.date_of_birth)
  return (
    <>
      <div className="mb-3 flex justify-end">
        <Btn variant="ghost" size="sm" onClick={() => go({ ...view, edit: true })}>Edit details</Btn>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardTitle>Personal</CardTitle>
          <KV rows={[['Name', s.name], ['Gender', s.gender], ['Date of birth', s.date_of_birth ? `${fmt(s.date_of_birth)} (${age} years)` : ''], ['Father', s.father_name], ['Mother', s.mother_name]]} />
        </Card>
        <Card>
          <CardTitle>Contact</CardTitle>
          <KV rows={[['Phone', s.phone], ['Email', s.email], ['Address', s.address], ['City', s.city], ['Pincode', s.pincode]]} />
        </Card>
        <Card>
          <CardTitle>Academic</CardTitle>
          <KV rows={[['Student ID', s.student_id], ['Class', sectionName], ['Department', s.department], ['Course', s.course]]} />
        </Card>
      </div>
      <PasswordCard />
    </>
  )
}
