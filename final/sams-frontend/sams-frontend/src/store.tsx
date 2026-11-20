import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import * as api from './api'
import type { AttendanceRecord, CalendarEvent, Faculty, Role, Section, Session, Status, Student, Subject } from './types'
import { emailRe } from './lib'

/** Which screen is open inside the portal. */
export interface View {
  tab: string
  classId?: string
  classMode?: 'mark' | 'list'
  edit?: boolean
}

export interface ShortageAlert {
  name: string
  pct: number
}

export interface RegisterInput {
  role: Role
  name: string
  email: string
  phone: string
  gender: string
  password: string
  section?: string
  subject?: string
  designation?: string
  qualification?: string
}

/** Every call that talks to the server is async and answers with an error message, or null when it worked. */
interface Store {
  subjects: Subject[]
  sections: Section[]
  events: CalendarEvent[]
  students: Student[]
  faculty: Faculty[]
  records: AttendanceRecord[]
  session: Session | null
  booting: boolean
  view: View
  canGoBack: boolean
  toastMsg: string
  toast: (msg: string) => void
  login: (ident: string, password: string) => Promise<string | null>
  register: (input: RegisterInput) => Promise<string | null>
  forgot: (ident: string) => Promise<string | null>
  logout: () => void
  go: (v: View) => void
  back: () => void
  checkPassword: (pw: string) => Promise<string | null>
  changePassword: (current: string, next: string) => Promise<string | null>
  updateStudent: (patch: api.StudentEdit) => Promise<string | null>
  updateFaculty: (patch: { phone: string; email: string }) => Promise<string | null>
  saveAttendance: (sectionId: string, date: string, marks: Record<string, Status>) => Promise<ShortageAlert[] | null>
}

const Ctx = createContext<Store | null>(null)

export function useStore(): Store {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore must be used inside StoreProvider')
  return c
}

const message = (e: unknown): string => (e instanceof api.ApiError ? e.message : 'Something went wrong.')

export function StoreProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [booting, setBooting] = useState(() => api.savedSession() !== null)
  const [view, setView] = useState<View>({ tab: 'profile' })
  const [stack, setStack] = useState<View[]>([])
  const [toastMsg, setToastMsg] = useState('')
  const timer = useRef<number | undefined>(undefined)

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToastMsg(''), 3200)
  }, [])

  const logout = useCallback(() => {
    api.clearSession()
    setSession(null)
    setStack([])
    setView({ tab: 'profile' })
  }, [])

  /** Loads what a signed-in person needs. The session is set last so no screen sees half-loaded data. */
  const enter = async (role: Role, id: string) => {
    if (role === 'student') {
      const [me, recs] = await Promise.all([api.studentMe(), api.studentRecords()])
      setStudents([me])
      setFaculty([])
      setRecords(recs)
    } else {
      const [me, roster, recs] = await Promise.all([api.facultyMe(), api.facultyRoster(), api.facultyRecords()])
      setFaculty([me])
      setStudents(roster)
      setRecords(recs)
    }
    api.rememberSession(role, id)
    setSession({ role, id })
    setView({ tab: 'profile' })
    setStack([])
  }

  // Subjects, classes and the calendar are public, so the register form can use them before sign-in.
  // If a session was saved in this browser tab, pick it up again after a reload.
  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      logout()
      toast('Your session expired. Please sign in again.')
    })
    api.reference()
      .then((r) => {
        setSubjects(r.subjects)
        setSections(r.sections)
        setEvents(r.events)
      })
      .catch(() => {})
    const saved = api.savedSession()
    if (!saved) return
    api.setToken(saved.token)
    enter(saved.role, saved.id)
      .catch(() => api.clearSession())
      .finally(() => setBooting(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login: Store['login'] = async (ident, password) => {
    try {
      const r = await api.login(ident.trim(), password)
      await enter(r.role, r.userId)
      toast(`Signed in as ${r.name}.`)
      return null
    } catch (e) {
      api.clearSession()
      return message(e)
    }
  }

  const register: Store['register'] = async (i) => {
    const name = i.name.trim()
    const email = i.email.trim()
    const phone = i.phone.trim()
    if (name.length < 2) return 'Enter your full name.'
    if (!emailRe.test(email)) return 'Enter a valid email address.'
    if (!/^\d{10}$/.test(phone)) return 'Phone must be 10 digits.'
    if (i.password.length < 8) return 'Password needs at least 8 characters.'
    try {
      const r =
        i.role === 'student'
          ? await api.registerStudent({ name, gender: i.gender, sectionId: i.section ?? sections[0]?.section_id ?? 'SEC1', phone, email, password: i.password })
          : await api.registerFaculty({
              name, gender: i.gender, subjectId: i.subject ?? subjects[0]?.subject_id ?? 'SUB101',
              designation: i.designation ?? 'Assistant Professor', qualification: (i.qualification ?? '').trim(), phone, email, password: i.password,
            })
      await enter(r.role, r.userId)
      toast(`Account created. Your ID is ${r.userId}.`)
      return null
    } catch (e) {
      api.clearSession()
      return message(e)
    }
  }

  const forgot: Store['forgot'] = async (ident) => {
    try {
      await api.forgot(ident)
      return null
    } catch (e) {
      return message(e)
    }
  }

  const go = (v: View) => {
    setStack((s) => [...s, view])
    setView(v)
  }

  const back = () => {
    if (!stack.length) return logout()
    setView(stack[stack.length - 1])
    setStack((s) => s.slice(0, -1))
  }

  const checkPassword: Store['checkPassword'] = async (pw) => {
    try {
      await api.verifyPassword(pw)
      return null
    } catch (e) {
      return message(e)
    }
  }

  const changePassword: Store['changePassword'] = async (current, next) => {
    try {
      await api.changePassword(current, next)
      return null
    } catch (e) {
      return message(e)
    }
  }

  const updateStudent: Store['updateStudent'] = async (patch) => {
    try {
      setStudents([await api.updateStudent(patch)])
      return null
    } catch (e) {
      return message(e)
    }
  }

  const updateFaculty: Store['updateFaculty'] = async (patch) => {
    try {
      setFaculty([await api.updateFaculty(patch)])
      return null
    } catch (e) {
      return message(e)
    }
  }

  /** Saves the day's marks on the server, then reloads the rows so every percentage on screen matches the database. */
  const saveAttendance: Store['saveAttendance'] = async (sectionId, date, marks) => {
    try {
      const alerts = await api.markAttendance(sectionId, date, marks)
      setRecords(await api.facultyRecords())
      return alerts
    } catch (e) {
      toast(message(e))
      return null
    }
  }

  const value: Store = {
    subjects, sections, events, students, faculty, records, session, booting, view, canGoBack: stack.length > 0, toastMsg, toast,
    login, register, forgot, logout, go, back, checkPassword, changePassword, updateStudent, updateFaculty, saveAttendance,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
