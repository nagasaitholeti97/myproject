// Types mirror the tables in the ER diagram (Student, Faculty, Subject, Section, Attendance, Academic_Calendar).

export type Role = 'student' | 'faculty'
export type Status = 'Present' | 'Absent'
export type EventType = 'Semester' | 'Holiday' | 'Exam' | 'Class Test' | 'Assignment' | 'Event'

export interface Subject {
  subject_id: string
  subject_name: string
  subject_code: string
}

export interface Section {
  section_id: string
  section_name: string
  department: string
  course: string
}

export interface Student {
  student_id: string
  section_id: string
  name: string
  gender: string
  date_of_birth: string
  phone: string
  email: string
  father_name: string
  mother_name: string
  address: string
  city: string
  pincode: string
  department: string
  course: string
}

export interface Faculty {
  faculty_id: string
  subject_id: string
  name: string
  age: number | null
  gender: string
  email: string
  phone: string
  qualification: string
  designation: string
  department: string
  experience: number
}

export interface AttendanceRecord {
  attendance_id: string
  student_id: string
  faculty_id: string
  section_id: string
  subject_id: string
  calendar_id: string
  attendance_date: string
  /** Index into PERIODS (0 to 4). */
  period: number
  attendance_status: Status
}

export interface CalendarEvent {
  calendar_id: string
  event_id: string
  title: string
  event_type: EventType
  start_date: string
  end_date: string
  academic_year: string
  subject_id: string
}

export interface Session {
  role: Role
  id: string
}

export interface SubjectStat {
  subject: Subject
  held: number
  attended: number
  pct: number | null
}
