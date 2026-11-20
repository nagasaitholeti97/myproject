import { useEffect, useState, type FormEvent } from 'react'
import { useStore } from '../store'
import { Btn, Card, Field, Msg } from './ui'

const STEPS = [
  { title: 'Enter your current password', label: 'Current password' },
  { title: 'Choose a new password', label: 'New password (8+ characters)' },
  { title: 'Confirm your new password', label: 'Confirm new password' },
]

/** Three-step change password pop-up: current, new, confirm. */
function Dialog({ onClose }: { onClose: () => void }) {
  const { checkPassword, changePassword, toast } = useStore()
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState(0)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [value, setValue] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (step === 0) {
      setBusy(true)
      const m = await checkPassword(value)
      setBusy(false)
      if (m) return setErr(m)
      setCurrent(value)
    } else if (step === 1) {
      if (value.length < 8) return setErr('New password needs at least 8 characters.')
      if (value === current) return setErr('Choose a password different from your current one.')
      setNext(value)
    } else {
      if (value !== next) return setErr('The passwords do not match. Try again.')
      setBusy(true)
      const m = await changePassword(current, next)
      setBusy(false)
      if (m) return setErr(m)
      toast('Password updated.')
      return onClose()
    }
    setErr('')
    setValue('')
    setStep(step + 1)
  }

  const prev = () => {
    setErr('')
    setValue('')
    setStep(step - 1)
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form onSubmit={submit} noValidate role="dialog" aria-modal="true" aria-label="Change password" className="grid w-full max-w-[420px] gap-4 rounded-2xl border border-line bg-surface p-6 shadow-2xl">
        <div className="flex gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => (
            <i key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-surface2'}`} />
          ))}
        </div>
        <div>
          <span className="text-[0.8rem] text-mut">Step {step + 1} of 3</span>
          <h3 className="font-head text-lg font-semibold">{STEPS[step].title}</h3>
        </div>
        <Field
          key={step}
          id="val"
          label={STEPS[step].label}
          type="password"
          required
          autoFocus
          autoComplete={step === 0 ? 'current-password' : 'new-password'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {err && <Msg tone="bad">{err}</Msg>}
        <div className="flex items-center justify-between">
          {step > 0 ? <Btn variant="ghost" onClick={prev}>Back</Btn> : <Btn variant="ghost" onClick={onClose}>Cancel</Btn>}
          <Btn type="submit" disabled={busy}>{step === 2 ? 'Update password' : 'Continue'}</Btn>
        </div>
      </form>
    </div>
  )
}

export function PasswordCard() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-head text-[1.05rem] font-semibold">Password</h3>
          <p className="text-[0.9rem] text-mut">Change it in three short steps.</p>
        </div>
        <Btn onClick={() => setOpen(true)}>Change password</Btn>
      </Card>
      {open && <Dialog onClose={() => setOpen(false)} />}
    </>
  )
}
