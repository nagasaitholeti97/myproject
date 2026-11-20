import type { AttendanceRecord, Subject, SubjectStat } from './types'

/** The demo treats this as "today". Change it to new Date().toISOString().slice(0, 10) once real data is connected. */
export const TODAY = '2026-11-11'
/** Minimum attendance percentage to be eligible for exams. */
export const MIN = 75
export const DEPT = 'Electronics & Communication Engineering'
export const PERIODS = ['09:00 – 10:00', '10:00 – 11:00', '11:00 – 12:00', '01:00 – 02:00', '02:00 – 03:00']
export const DEMO_STUDENT = '24ECE3002'
export const DEMO_FACULTY = 'F101'
export const DEMO_PASSWORD = 'demo123'
export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type Tone = 'ok' | 'warn' | 'bad' | 'none'

export const D = (iso: string): Date => new Date(iso + 'T00:00:00Z')

export function fmt(
  iso: string | undefined,
  o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  return iso ? D(iso).toLocaleDateString('en-IN', { timeZone: 'UTC', ...o }) : '—'
}

export const dayDiff = (a: string, b: string): number => Math.round((D(b).getTime() - D(a).getTime()) / 864e5)

export function level(p: number | null): { tone: Tone; label: string } {
  if (p == null) return { tone: 'none', label: 'No classes' }
  if (p >= 80) return { tone: 'ok', label: 'Good' }
  if (p >= MIN) return { tone: 'warn', label: 'Borderline' }
  return { tone: 'bad', label: 'Shortage' }
}

export const pctTxt = (p: number | null): string => (p == null ? '–' : p.toFixed(1) + '%')

export const initials = (name: string): string =>
  name
    .replace(/^(Dr|Prof|Mr|Ms|Mrs)\.\s*/, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export function ageOn(dob: string): number | null {
  if (!dob) return null
  const t = D(TODAY)
  const b = D(dob)
  let a = t.getUTCFullYear() - b.getUTCFullYear()
  const m = t.getUTCMonth() - b.getUTCMonth()
  if (m < 0 || (m === 0 && t.getUTCDate() < b.getUTCDate())) a--
  return a
}

/** Attendance of one student in one subject. */
export function subStat(records: AttendanceRecord[], studentId: string, subjectId: string) {
  let held = 0
  let attended = 0
  for (const r of records) {
    if (r.student_id === studentId && r.subject_id === subjectId) {
      held++
      if (r.attendance_status === 'Present') attended++
    }
  }
  return { held, attended, pct: held ? (attended / held) * 100 : null }
}

/** Attendance of one student in every subject. */
export function statsFor(records: AttendanceRecord[], subjects: Subject[], studentId: string): SubjectStat[] {
  return subjects.map((subject) => ({ subject, ...subStat(records, studentId, subject.subject_id) }))
}

/** What the student needs to do to stay at or reach the minimum percentage. */
export function advice(held: number, attended: number, pct: number | null): string {
  if (!held || pct == null) return 'No classes yet'
  if (pct < MIN) return `Attend the next ${Math.max(0, Math.ceil(3 * held - 4 * attended))} in a row to reach ${MIN}%`
  const skip = Math.max(0, Math.floor((4 * attended - 3 * held) / 3))
  return skip ? `You can miss ${skip} more and stay at ${MIN}%` : 'No spare classes left'
}
