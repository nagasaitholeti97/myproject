import { useState, type FormEvent } from 'react'
import { DEMO_PASSWORD, DEMO_STUDENT } from '../lib'
import { useStore } from '../store'
import { Btn, Field, Msg, SelectField, Seg } from '../components/ui'
import type { Role } from '../types'

type Mode = 'login' | 'register' | 'forgot'

const linkCls = 'cursor-pointer border-0 bg-transparent p-0 font-semibold text-accent hover:underline'

/** Sign-in, register and forgot password, all on the home page. */
export default function Auth() {
  const [mode, setMode] = useState<Mode>('login')
  const change = (m: Mode) => setMode(m)

  return (
    <div className="relative grid min-h-[calc(100svh-9rem)] place-items-center px-0 pt-52 pb-8 md:pt-8">
      <img
        src="/logo.png"
        alt=""
        className="logo-mono pointer-events-none absolute top-4 left-1/2 h-36 -translate-x-1/2 md:top-1/2 md:left-[9%] md:h-[80%] md:translate-x-0 md:-translate-y-1/2"
      />
      {mode === 'login' && <Login onMode={change} />}
      {mode === 'register' && <Register onMode={change} />}
      {mode === 'forgot' && <Forgot onMode={change} />}
    </div>
  )
}

const shell = 'relative grid w-full gap-4 rounded-[20px] border border-line bg-surface p-7 shadow-[0_12px_32px_rgb(20_27_45/0.14)]'

function Logo() {
  return <span className="grid h-[34px] place-items-center justify-self-start rounded-lg bg-accent px-3.5 font-head text-base font-bold tracking-[0.14em] text-accentink">SAMS</span>
}

function Login({ onMode }: { onMode: (m: Mode) => void }) {
  const { login } = useStore()
  const [busy, setBusy] = useState(false)
  const [ident, setIdent] = useState(DEMO_STUDENT)
  const [pw, setPw] = useState(DEMO_PASSWORD)
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const m = await login(ident, pw)
    if (m) {
      setErr(m)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className={`${shell} max-w-[400px]`}>
      <Logo />
      <h2 className="font-head text-[1.7rem] font-semibold">Welcome back</h2>
      <Field id="ident" label="ID or email" autoComplete="username" required value={ident} onChange={(e) => setIdent(e.target.value)} />
      <div className="grid gap-1.5">
        <label htmlFor="password" className="text-[0.82rem] font-semibold text-mut">Password</label>
        <div className="relative flex items-center">
          <input
            id="password" name="password" type={show ? 'text' : 'password'} required autoComplete="current-password"
            value={pw} onChange={(e) => setPw(e.target.value)}
            className="w-full min-w-0 rounded-lg border border-line bg-surface py-2.5 pr-12 pl-3 text-ink focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-accent"
          />
          <button
            type="button" aria-pressed={show} aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}
            className="absolute right-1.5 grid size-9 cursor-pointer place-items-center rounded-lg text-mut hover:bg-surface2 hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>
      <div className="-mt-1.5 flex justify-end">
        <button type="button" className={`${linkCls} text-sm`} onClick={() => onMode('forgot')}>Forgot password?</button>
      </div>
      {err && <Msg tone="bad">{err}</Msg>}
      <Btn type="submit" size="lg" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Btn>
      <p className="text-[0.9rem] text-mut">
        New here? <button type="button" className={linkCls} onClick={() => onMode('register')}>Register</button>
      </p>
    </form>
  )
}

function Register({ onMode }: { onMode: (m: Mode) => void }) {
  const { register, sections, subjects } = useStore()
  const [busy, setBusy] = useState(false)
  const [role, setRole] = useState<Role>('student')
  const [err, setErr] = useState('')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    setBusy(true)
    const m = await register({
      role, name: f.name, email: f.email, phone: f.phone, gender: f.gender, password: f.password,
      section: f.section, subject: f.subject, designation: f.designation, qualification: f.qualification,
    })
    if (m) {
      setErr(m)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className={`${shell} max-w-[560px]`}>
      <Btn variant="ghost" size="sm" className="justify-self-start" onClick={() => onMode('login')}>‹ Back</Btn>
      <Logo />
      <h2 className="font-head text-[1.7rem] font-semibold">Create account</h2>
      <div className="justify-self-start">
        <Seg label="Register as" value={role} onChange={setRole} options={[['student', 'I am a student'], ['faculty', 'I am faculty']]} />
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field id="name" label="Full name" autoComplete="name" required />
        <Field id="email" label="Email" type="email" autoComplete="email" required />
        <Field id="phone" label="Phone (10 digits)" autoComplete="tel" required />
        <SelectField id="gender" label="Gender" options={['Female', 'Male', 'Other']} defaultValue="Female" />
        {role === 'student' ? (
          <SelectField id="section" label="Class" options={sections.map((s): [string, string] => [s.section_id, s.section_name])} defaultValue="SEC1" />
        ) : (
          <>
            <SelectField id="subject" label="Subject taught" options={subjects.map((s): [string, string] => [s.subject_id, s.subject_name])} defaultValue="SUB101" />
            <SelectField id="designation" label="Designation" options={['Assistant Professor', 'Associate Professor', 'Professor']} defaultValue="Assistant Professor" />
            <Field id="qualification" label="Qualification" placeholder="e.g. M.Tech (VLSI)" />
          </>
        )}
        <Field id="password" label="Password (8+ characters)" type="password" autoComplete="new-password" required />
      </div>
      {err && <Msg tone="bad">{err}</Msg>}
      <Btn type="submit" size="lg" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Btn>
      <p className="text-[0.9rem] text-mut">
        Already have an account? <button type="button" className={linkCls} onClick={() => onMode('login')}>Sign in</button>
      </p>
    </form>
  )
}

function Forgot({ onMode }: { onMode: (m: Mode) => void }) {
  const { forgot } = useStore()
  const [info, setInfo] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = String(new FormData(e.currentTarget).get('ident') ?? '').trim()
    if (!q) {
      setErr('Enter your ID or email.')
      setInfo('')
      return
    }
    const m = await forgot(q)
    if (m) {
      setErr(m)
      setInfo('')
      return
    }
    setErr('')
    setInfo('If an account matches, a reset link has been sent to its email. Email sending is not set up yet, so use your current password.')
  }

  return (
    <form onSubmit={submit} noValidate className={`${shell} max-w-[400px]`}>
      <Btn variant="ghost" size="sm" className="justify-self-start" onClick={() => onMode('login')}>‹ Back</Btn>
      <Logo />
      <h2 className="font-head text-[1.7rem] font-semibold">Forgot password</h2>
      <p className="text-[0.92rem] text-mut">Enter your ID or email. We will send a reset link to the email on your account.</p>
      <Field id="ident" label="ID or email" autoComplete="username" required />
      {err && <Msg tone="bad">{err}</Msg>}
      {info && <Msg tone="ok">{info}</Msg>}
      <Btn type="submit" size="lg">Send reset link</Btn>
      <p className="text-[0.9rem] text-mut">
        <button type="button" className={linkCls} onClick={() => onMode('login')}>‹ Back to sign in</button>
      </p>
    </form>
  )
}
