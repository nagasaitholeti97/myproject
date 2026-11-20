import type { AttendanceRecord, CalendarEvent, EventType, Faculty, Role, Section, Status, Student, Subject } from './types'

/** Where the Spring Boot backend runs. Change it with VITE_API_URL in a .env file. */
const BASE: string = String(import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

const KEY = 'sams.session'
let token: string | null = null
let onUnauthorized: () => void = () => {}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn
}

// ---------- token and saved session (sessionStorage can be missing or blocked, so every call is guarded)
export interface SavedSession {
  token: string
  role: Role
  id: string
}

export function savedSession(): SavedSession | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedSession) : null
  } catch {
    return null
  }
}

export function rememberSession(role: Role, id: string) {
  try {
    if (token) sessionStorage.setItem(KEY, JSON.stringify({ token, role, id } satisfies SavedSession))
  } catch {
    /* ignore */
  }
}

export function setToken(t: string | null) {
  token = t
}

export function clearSession() {
  token = null
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

// ---------- fetch wrapper
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check that the backend is running.')
  }
  if (!res.ok) {
    let message = ''
    try {
      message = ((await res.json()) as { message?: string }).message ?? ''
    } catch {
      /* no JSON body */
    }
    if (res.status === 401 && token && !path.startsWith('/api/auth/login')) onUnauthorized()
    throw new ApiError(res.status, message || (res.status === 401 ? 'Please sign in again.' : 'Something went wrong.'))
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

// ---------- the JSON the backend sends (see Dtos.java)
interface WireSubject { id: string; code: string; name: string }
interface WireSection { id: string; name: string; year: number; department: string; course: string }
interface WireEvent {
  id: number; code: string; title: string; type: string; startDate: string; endDate: string
  academicYear: string; subjectId: string | null
}
interface WireReference { subjects: WireSubject[]; sections: WireSection[]; events: WireEvent[]; today: string }
interface WireStudent {
  studentId: string; name: string; gender: string; dateOfBirth: string | null; phone: string; email: string
  fatherName: string; motherName: string; address: string; city: string; pincode: string; department: string
  course: string; sectionId: string
}
interface WireFaculty {
  facultyId: string; name: string; gender: string; age: number | null; designation: string; qualification: string
  experience: number | null; department: string; phone: string; email: string; subjectId: string
}
interface WireRecord {
  id: number; studentId: string; facultyId: string; sectionId: string; subjectId: string; date: string
  period: number; status: 'PRESENT' | 'ABSENT'
}
interface WireRoster { id: string; name: string; phone: string; email: string; sectionId: string }
interface WireLogin { token: string; role: 'STUDENT' | 'FACULTY'; userId: string; name: string }
interface WireMarkResult { alerts: { studentId: string; name: string; percentage: number }[] }
interface WireMessage { message: string }

// ---------- wire to the shapes the screens already use
const EVENT_TYPES: Record<string, EventType> = {
  SEMESTER: 'Semester', HOLIDAY: 'Holiday', EXAM: 'Exam', CLASS_TEST: 'Class Test', ASSIGNMENT: 'Assignment', EVENT: 'Event',
}

const toStudent = (s: WireStudent): Student => ({
  student_id: s.studentId, section_id: s.sectionId, name: s.name, gender: s.gender, date_of_birth: s.dateOfBirth ?? '',
  phone: s.phone, email: s.email, father_name: s.fatherName ?? '', mother_name: s.motherName ?? '', address: s.address ?? '',
  city: s.city ?? '', pincode: s.pincode ?? '', department: s.department, course: s.course,
})

const toRosterStudent = (s: WireRoster): Student => ({
  student_id: s.id, section_id: s.sectionId, name: s.name, gender: '', date_of_birth: '', phone: s.phone, email: s.email,
  father_name: '', mother_name: '', address: '', city: '', pincode: '', department: '', course: '',
})

const toFaculty = (f: WireFaculty): Faculty => ({
  faculty_id: f.facultyId, subject_id: f.subjectId, name: f.name, age: f.age, gender: f.gender, email: f.email, phone: f.phone,
  qualification: f.qualification ?? '', designation: f.designation, department: f.department, experience: f.experience ?? 0,
})

const toRecord = (r: WireRecord): AttendanceRecord => ({
  attendance_id: 'ATT' + String(r.id).padStart(5, '0'), student_id: r.studentId, faculty_id: r.facultyId, section_id: r.sectionId,
  subject_id: r.subjectId, calendar_id: 'CAL01', attendance_date: r.date, period: r.period,
  attendance_status: r.status === 'PRESENT' ? 'Present' : 'Absent',
})

const toEvent = (e: WireEvent): CalendarEvent => ({
  calendar_id: String(e.id), event_id: e.code ?? '', title: e.title, event_type: EVENT_TYPES[e.type] ?? 'Event',
  start_date: e.startDate, end_date: e.endDate, academic_year: e.academicYear, subject_id: e.subjectId ?? '',
})

// ---------- calls
export interface Reference {
  subjects: Subject[]
  sections: Section[]
  events: CalendarEvent[]
  today: string
}

export async function reference(): Promise<Reference> {
  const r = await request<WireReference>('GET', '/api/reference')
  return {
    subjects: r.subjects.map((s) => ({ subject_id: s.id, subject_name: s.name, subject_code: s.code })),
    sections: r.sections.map((s) => ({ section_id: s.id, section_name: s.name, department: s.department, course: s.course })),
    events: r.events.map(toEvent),
    today: r.today,
  }
}

export interface LoginResult {
  role: Role
  userId: string
  name: string
}

function signedIn(r: WireLogin): LoginResult {
  token = r.token
  return { role: r.role === 'STUDENT' ? 'student' : 'faculty', userId: r.userId, name: r.name }
}

export const login = async (ident: string, password: string) =>
  signedIn(await request<WireLogin>('POST', '/api/auth/login', { userId: ident, password }))

export const registerStudent = async (b: { name: string; gender: string; sectionId: string; phone: string; email: string; password: string }) =>
  signedIn(await request<WireLogin>('POST', '/api/auth/register', b))

export const registerFaculty = async (b: {
  name: string; gender: string; subjectId: string; designation: string; qualification: string; phone: string; email: string; password: string
}) => signedIn(await request<WireLogin>('POST', '/api/auth/register-faculty', b))

export const forgot = (identifier: string) => request<WireMessage>('POST', '/api/auth/forgot', { identifier })
export const verifyPassword = (password: string) => request<WireMessage>('POST', '/api/auth/verify-password', { password })
export const changePassword = (currentPassword: string, newPassword: string) =>
  request<WireMessage>('POST', '/api/auth/change-password', { currentPassword, newPassword })

export type StudentEdit = Pick<Student, 'date_of_birth' | 'father_name' | 'mother_name' | 'phone' | 'email' | 'address' | 'city' | 'pincode'>

export const studentMe = async () => toStudent(await request<WireStudent>('GET', '/api/student/me'))
export const studentRecords = async () => (await request<WireRecord[]>('GET', '/api/student/attendance/records')).map(toRecord)
export const updateStudent = async (p: StudentEdit) =>
  toStudent(
    await request<WireStudent>('PUT', '/api/student/me', {
      dateOfBirth: p.date_of_birth || null, fatherName: p.father_name, motherName: p.mother_name, phone: p.phone, email: p.email,
      address: p.address, city: p.city, pincode: p.pincode,
    }),
  )

export const facultyMe = async () => toFaculty(await request<WireFaculty>('GET', '/api/faculty/me'))
export const facultyRoster = async () => (await request<WireRoster[]>('GET', '/api/faculty/students')).map(toRosterStudent)
export const facultyRecords = async () => (await request<WireRecord[]>('GET', '/api/faculty/records')).map(toRecord)
export const updateFaculty = async (p: { phone: string; email: string }) =>
  toFaculty(await request<WireFaculty>('PUT', '/api/faculty/me/contact', p))

export async function markAttendance(sectionId: string, date: string, marks: Record<string, Status>) {
  const r = await request<WireMarkResult>('POST', `/api/faculty/classes/${encodeURIComponent(sectionId)}/attendance`, {
    date,
    marks: Object.entries(marks).map(([studentId, s]) => ({ studentId, status: s === 'Present' ? 'PRESENT' : 'ABSENT' })),
  })
  return r.alerts.map((a) => ({ name: a.name, pct: a.percentage }))
}
