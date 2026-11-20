import { useStore } from '../../store'
import { BackBtn, Hero, Tabs } from '../../components/ui'
import Profile from './Profile'
import Attendance from './Attendance'
import CalendarView from './Calendar'

export default function StudentPortal() {
  const { session, students, sections, view, go } = useStore()
  const s = students.find((x) => x.student_id === session?.id)
  if (!s) return null
  const sectionName = sections.find((x) => x.section_id === s.section_id)?.section_name ?? ''

  return (
    <>
      <BackBtn />
      <Hero kind="Student" name={s.name} chips={[s.student_id, sectionName, s.course]} />
      <Tabs
        active={view.tab}
        onChange={(t) => t !== view.tab && go({ tab: t })}
        tabs={[['profile', 'Profile'], ['attendance', 'Attendance'], ['calendar', 'Academic calendar']]}
      />
      {view.tab === 'attendance' ? <Attendance s={s} /> : view.tab === 'calendar' ? <CalendarView /> : <Profile s={s} />}
    </>
  )
}
