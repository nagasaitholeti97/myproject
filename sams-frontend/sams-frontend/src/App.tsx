import { useEffect, useState } from 'react'
import { useStore } from './store'
import { Toast } from './components/ui'
import Auth from './pages/Auth'
import StudentPortal from './pages/student/StudentPortal'
import FacultyPortal from './pages/faculty/FacultyPortal'

export default function App() {
  const { session, booting } = useStore()
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  // The faculty portal switches the accent colour to green through data-role.
  useEffect(() => {
    const root = document.documentElement
    if (session?.role === 'faculty') root.setAttribute('data-role', 'faculty')
    else root.removeAttribute('data-role')
  }, [session])

  const toggleTheme = () => {
    const root = document.documentElement
    const current = theme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    const next = current === 'dark' ? 'light' : 'dark'
    root.setAttribute('data-theme', next)
    setTheme(next)
  }

  return (
    <>
      <div className="wm" aria-hidden="true" />
      <header className="sticky top-0 z-20 border-b border-line bg-surface px-4">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between py-2.5">
          <span className="grid h-[34px] place-items-center rounded-lg bg-accent px-3.5 font-head font-bold tracking-[0.14em] text-accentink" aria-label="SAMS">
            SAMS
          </span>
          <button
            type="button" onClick={toggleTheme} aria-label="Switch light or dark theme" title="Switch theme"
            className="grid size-9 cursor-pointer place-items-center rounded-lg border border-line bg-surface hover:bg-surface2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          </button>
        </div>
      </header>
      <main className="relative z-[1] mx-auto max-w-[1160px] px-4 pt-6 pb-14">
        {booting ? <p className="mt-10 text-center text-mut">Loading…</p> : !session ? <Auth /> : session.role === 'student' ? <StudentPortal /> : <FacultyPortal />}
      </main>
      <footer className="relative z-[1] mx-auto max-w-[1160px] px-4 pb-8 text-[0.82rem] text-mut">
        Demo with sample students, faculty and dates. Passwords are stored encrypted. Reset emails are not sent yet.
      </footer>
      <Toast />
    </>
  )
}
