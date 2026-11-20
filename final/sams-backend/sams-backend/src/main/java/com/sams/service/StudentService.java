package com.sams.service;

import static java.util.stream.Collectors.groupingBy;

import com.sams.config.SamsProperties;
import com.sams.domain.AttendanceMath;
import com.sams.domain.AttendanceMath.Stat;
import com.sams.domain.Periods;
import com.sams.dto.Dtos.*;
import com.sams.entity.*;
import com.sams.exception.ApiException;
import com.sams.repository.*;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StudentService {

    private final StudentRepository students;
    private final AttendanceRepository attendance;
    private final FacultyRepository faculty;
    private final AcademicEventRepository events;
    private final TimetableService timetable;
    private final SamsProperties props;

    public StudentService(StudentRepository students, AttendanceRepository attendance, FacultyRepository faculty,
                          AcademicEventRepository events, TimetableService timetable, SamsProperties props) {
        this.students = students;
        this.attendance = attendance;
        this.faculty = faculty;
        this.events = events;
        this.timetable = timetable;
        this.props = props;
    }

    private Student student(String id) {
        return students.findById(id).orElseThrow(() -> ApiException.notFound("Student"));
    }

    private static boolean isAll(String v) {
        return v == null || v.isBlank() || v.equalsIgnoreCase("all");
    }

    private static YearMonth parseMonth(String month) {
        if (isAll(month)) return null;
        try {
            return YearMonth.parse(month);
        } catch (RuntimeException e) {
            throw ApiException.badRequest("Month must look like 2026-11.");
        }
    }

    private static String monthLabel(YearMonth m) {
        return m.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + m.getYear();
    }

    private static Stat stat(Collection<Attendance> rows, int min) {
        int held = rows.size();
        int att = (int) rows.stream().filter(a -> a.getStatus() == Status.PRESENT).count();
        return AttendanceMath.of(held, att, min);
    }

    public StudentProfile profile(String id) {
        Student s = student(id);
        Section sec = s.getSection();
        return new StudentProfile(s.getId(), s.getName(), s.getGender(), s.getDateOfBirth(), s.getPhone(),
            s.getEmail(), s.getFatherName(), s.getMotherName(), s.getAddress(), s.getCity(), s.getPincode(),
            s.getDepartment(), s.getCourse(), sec.getId(), sec.getName(), sec.getYear());
    }

    /** The details a student may change. Name, ID, class, department and course are set by the college office. */
    @Transactional
    public StudentProfile updateProfile(String id, StudentUpdate u) {
        Student s = student(id);
        s.setDateOfBirth(u.dateOfBirth());
        s.setFatherName(blank(u.fatherName()));
        s.setMotherName(blank(u.motherName()));
        s.setPhone(u.phone());
        s.setEmail(u.email().trim());
        s.setAddress(blank(u.address()));
        s.setCity(blank(u.city()));
        s.setPincode(blank(u.pincode()));
        return profile(id);
    }

    private static String blank(String v) {
        return v == null ? "" : v.trim();
    }

    /** The student's own attendance rows. */
    public List<RecordDto> records(String id) {
        student(id);
        return attendance.findByStudentId(id).stream().map(a -> new RecordDto(a.getId(), a.getStudent().getId(),
            a.getFaculty().getId(), a.getSection().getId(), a.getSubject().getId(), a.getDate(), a.getPeriod(),
            a.getStatus().name())).toList();
    }

    private SubjectStat toSubjectStat(Subject sub, Stat st) {
        String facultyName = faculty.findAll().stream()
            .filter(f -> f.getSubject().getId().equals(sub.getId())).map(Faculty::getName).findFirst().orElse("");
        return new SubjectStat(sub.getId(), sub.getCode(), sub.getName(), facultyName, st.held(), st.attended(),
            st.absent(), st.percentage(), st.level(), st.eligible(), st.classesNeeded(), st.canMiss());
    }

    public Summary summary(String id) {
        student(id);
        int min = props.minimum();
        List<Attendance> all = attendance.findByStudentId(id);
        Map<String, List<Attendance>> bySubject = all.stream().collect(groupingBy(a -> a.getSubject().getId()));
        List<SubjectStat> rows = timetable.orderedSubjects().stream()
            .map(sub -> toSubjectStat(sub, stat(bySubject.getOrDefault(sub.getId(), List.of()), min)))
            .toList();
        Stat overall = stat(all, min);
        int below = (int) rows.stream().filter(r -> r.held() > 0 && !r.eligible()).count();
        int eligible = (int) rows.stream().filter(r -> r.held() > 0 && r.eligible()).count();
        EventDto next = events.findByTypeNotAndEndDateGreaterThanEqualOrderByStartDate(EventType.SEMESTER, props.today())
            .stream().filter(e -> e.getType() != EventType.HOLIDAY).findFirst().map(StudentService::toDto).orElse(null);
        return new Summary(overall.percentage(), overall.held(), overall.attended(), min, below, eligible, next, rows);
    }

    /** Bars for the subject chart. Mirrors the Month and Subject dropdowns on the website. */
    public Chart chart(String id, String subjectId, String month) {
        student(id);
        int min = props.minimum();
        YearMonth sel = parseMonth(month);
        List<Attendance> all = attendance.findByStudentId(id);
        List<YearMonth> months = all.stream().map(a -> YearMonth.from(a.getDate())).distinct().sorted().toList();
        if (sel != null && !months.contains(sel)) sel = null;
        final YearMonth selected = sel;
        List<String> monthKeys = months.stream().map(YearMonth::toString).toList();
        List<ChartRow> rows = new ArrayList<>();
        String title;
        if (isAll(subjectId)) {
            title = "Attendance by subject";
            Map<String, List<Attendance>> bySubject = all.stream().collect(groupingBy(a -> a.getSubject().getId()));
            for (Subject sub : timetable.orderedSubjects()) {
                List<Attendance> list = bySubject.getOrDefault(sub.getId(), List.of());
                if (selected != null) {
                    list = list.stream().filter(a -> YearMonth.from(a.getDate()).equals(selected)).toList();
                }
                rows.add(row(sub.getName(), stat(list, min), selected == null ? "all" : "month", min));
            }
        } else {
            Subject sub = timetable.orderedSubjects().stream().filter(s -> s.getId().equals(subjectId)).findFirst()
                .orElseThrow(() -> ApiException.notFound("Subject"));
            title = "Attendance in " + sub.getName();
            List<Attendance> mine = all.stream().filter(a -> a.getSubject().getId().equals(sub.getId())).toList();
            for (YearMonth m : selected == null ? months : List.of(selected)) {
                rows.add(row(monthLabel(m),
                    stat(mine.stream().filter(a -> YearMonth.from(a.getDate()).equals(m)).toList(), min), "month", min));
            }
            if (selected == null) rows.add(row("All months", stat(mine, min), "all", min));
        }
        return new Chart(title, min, monthKeys, rows);
    }

    private static ChartRow row(String label, Stat st, String mode, int min) {
        return new ChartRow(label, st.held(), st.attended(), st.percentage(), mode,
            st.held() > 0 && st.percentage() < min);
    }

    public SubjectDetail subjectDetail(String id, String subjectId) {
        Student s = student(id);
        Subject sub = timetable.orderedSubjects().stream().filter(x -> x.getId().equals(subjectId)).findFirst()
            .orElseThrow(() -> ApiException.notFound("Subject"));
        List<Attendance> mine = attendance.findByStudentId(id).stream()
            .filter(a -> a.getSubject().getId().equals(subjectId)).toList();
        Faculty f = faculty.findAll().stream().filter(x -> x.getSubject().getId().equals(subjectId)).findFirst().orElse(null);
        // Monday to Friday of the current week; the hour only depends on the weekday.
        LocalDate monday = props.today().with(DayOfWeek.MONDAY);
        List<UsualHour> hours = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            LocalDate d = monday.plusDays(i);
            int p = timetable.period(s.getSection().getId(), subjectId, d);
            hours.add(new UsualHour(d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), p, Periods.TIMES.get(p)));
        }
        return new SubjectDetail(toSubjectStat(sub, stat(mine, props.minimum())),
            f == null ? null : f.getEmail(), f == null ? null : f.getDesignation(), s.getSection().getName(), hours);
    }

    /** One Monday-to-Friday week of the hourly record. weekOffset 0 is the latest week that has classes. */
    public WeekView hourly(String id, String subjectId, String month, int weekOffset) {
        student(id);
        YearMonth sel = parseMonth(month);
        List<Attendance> log = attendance.findByStudentId(id).stream()
            .filter(a -> isAll(subjectId) || a.getSubject().getId().equals(subjectId))
            .filter(a -> sel == null || YearMonth.from(a.getDate()).equals(sel))
            .toList();
        List<LocalDate> weeks = log.stream().map(a -> a.getDate().with(DayOfWeek.MONDAY)).distinct()
            .sorted(Comparator.reverseOrder()).toList();
        if (weeks.isEmpty()) {
            return new WeekView(0, 0, null, null, Periods.TIMES, List.of());
        }
        int offset = Math.max(0, Math.min(weekOffset, weeks.size() - 1));
        LocalDate monday = weeks.get(offset);
        Map<String, Attendance> byKey = new HashMap<>();
        for (Attendance a : log) byKey.put(a.getDate() + "|" + a.getPeriod(), a);
        List<DayRow> days = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            LocalDate d = monday.plusDays(i);
            List<Slot> slots = new ArrayList<>();
            for (int p = 0; p < Periods.TIMES.size(); p++) {
                Attendance a = byKey.get(d + "|" + p);
                slots.add(a == null ? null : new Slot(p, Periods.TIMES.get(p), a.getSubject().getId(),
                    a.getSubject().getName(), a.getStatus().name()));
            }
            days.add(new DayRow(d, d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), slots));
        }
        return new WeekView(offset, weeks.size(), monday, monday.plusDays(4), Periods.TIMES, days);
    }

    static EventDto toDto(AcademicEvent e) {
        Subject s = e.getSubject();
        return new EventDto(e.getId(), e.getCode(), e.getTitle(), e.getType().name(), e.getStartDate(), e.getEndDate(),
            e.getAcademicYear(), s == null ? null : s.getId(), s == null ? null : s.getName());
    }
}
