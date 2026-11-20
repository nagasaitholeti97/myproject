package com.sams.service;

import static java.util.stream.Collectors.groupingBy;

import com.sams.config.SamsProperties;
import com.sams.domain.AttendanceMath;
import com.sams.domain.AttendanceMath.Stat;
import com.sams.dto.Dtos.*;
import com.sams.entity.*;
import com.sams.exception.ApiException;
import com.sams.repository.*;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FacultyService {

    private final FacultyRepository faculty;
    private final SectionRepository sections;
    private final StudentRepository students;
    private final AttendanceRepository attendance;
    private final TimetableService timetable;
    private final SamsProperties props;

    public FacultyService(FacultyRepository faculty, SectionRepository sections, StudentRepository students,
                          AttendanceRepository attendance, TimetableService timetable, SamsProperties props) {
        this.faculty = faculty;
        this.sections = sections;
        this.students = students;
        this.attendance = attendance;
        this.timetable = timetable;
        this.props = props;
    }

    private Faculty faculty(String id) {
        return faculty.findById(id).orElseThrow(() -> ApiException.notFound("Faculty"));
    }

    private Section section(String id) {
        return sections.findById(id).orElseThrow(() -> ApiException.notFound("Class"));
    }

    private static Stat stat(Collection<Attendance> rows, int min) {
        int att = (int) rows.stream().filter(a -> a.getStatus() == Status.PRESENT).count();
        return AttendanceMath.of(rows.size(), att, min);
    }

    public FacultyProfile profile(String id) {
        Faculty f = faculty(id);
        Subject s = f.getSubject();
        return new FacultyProfile(f.getId(), f.getName(), f.getGender(), f.getAge(), f.getDesignation(),
            f.getQualification(), f.getExperience(), f.getDepartment(), f.getPhone(), f.getEmail(),
            s.getId(), s.getName(), s.getCode());
    }

    @Transactional
    public FacultyProfile updateContact(String id, ContactUpdate u) {
        Faculty f = faculty(id);
        f.setPhone(u.phone());
        f.setEmail(u.email().trim());
        return profile(id);
    }

    /** One card per class (section) for the subject this faculty member teaches. */
    public List<ClassCard> classes(String id) {
        Faculty f = faculty(id);
        int min = props.minimum();
        List<ClassCard> cards = new ArrayList<>();
        for (Section sec : sections.findAll().stream().sorted(Comparator.comparing(Section::getId)).toList()) {
            List<Student> list = students.findBySectionIdOrderById(sec.getId());
            List<Attendance> rows = attendance.findBySectionIdAndSubjectId(sec.getId(), f.getSubject().getId());
            Map<String, List<Attendance>> byStudent = rows.stream().collect(groupingBy(a -> a.getStudent().getId()));
            int below = 0;
            for (Student s : list) {
                Stat st = stat(byStudent.getOrDefault(s.getId(), List.of()), min);
                if (st.percentage() != null && st.percentage() < min) below++;
            }
            Stat avg = stat(rows, min);
            cards.add(new ClassCard(sec.getId(), sec.getName(), sec.getYear(), list.size(), avg.percentage(),
                avg.level(), below));
        }
        return cards;
    }

    /** Every student in every class, with basic details only. */
    public List<RosterStudent> roster() {
        return students.findAllByOrderById().stream()
            .map(s -> new RosterStudent(s.getId(), s.getName(), s.getPhone(), s.getEmail(), s.getSection().getId()))
            .toList();
    }

    /** Attendance rows of the subject this faculty member teaches, for every class. */
    public List<RecordDto> records(String facultyId) {
        Faculty f = faculty(facultyId);
        return attendance.findBySubjectId(f.getSubject().getId()).stream().map(a -> new RecordDto(a.getId(),
            a.getStudent().getId(), a.getFaculty().getId(), a.getSection().getId(), a.getSubject().getId(),
            a.getDate(), a.getPeriod(), a.getStatus().name())).toList();
    }

    public List<ClassStudent> students(String facultyId, String sectionId) {
        Faculty f = faculty(facultyId);
        section(sectionId);
        int min = props.minimum();
        Map<String, List<Attendance>> byStudent = attendance
            .findBySectionIdAndSubjectId(sectionId, f.getSubject().getId()).stream()
            .collect(groupingBy(a -> a.getStudent().getId()));
        return students.findBySectionIdOrderById(sectionId).stream().map(s -> {
            Stat st = stat(byStudent.getOrDefault(s.getId(), List.of()), min);
            return new ClassStudent(s.getId(), s.getName(), s.getPhone(), st.held(), st.attended(), st.percentage(), st.level());
        }).toList();
    }

    /** Saved marks for a date. Students without a saved mark default to PRESENT. */
    public ClassDay day(String facultyId, String sectionId, LocalDate date) {
        Faculty f = faculty(facultyId);
        section(sectionId);
        Map<String, Status> saved = attendance
            .findBySectionIdAndSubjectIdAndDate(sectionId, f.getSubject().getId(), date).stream()
            .collect(Collectors.toMap(a -> a.getStudent().getId(), Attendance::getStatus));
        List<MarkEntry> marks = students.findBySectionIdOrderById(sectionId).stream()
            .map(s -> new MarkEntry(s.getId(), saved.getOrDefault(s.getId(), Status.PRESENT))).toList();
        return new ClassDay(sectionId, date, !saved.isEmpty(), isWeekend(date), marks);
    }

    private static boolean isWeekend(LocalDate d) {
        return d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY;
    }

    /** Saves (or replaces) the day's marks, then lists everyone who is now below the minimum. */
    @Transactional
    public MarkResult mark(String facultyId, String sectionId, MarkRequest req) {
        Faculty f = faculty(facultyId);
        Section sec = section(sectionId);
        Subject sub = f.getSubject();
        LocalDate date = req.date();
        if (date.isAfter(props.today())) {
            throw ApiException.badRequest("Choose a class date on or before today.");
        }
        Map<String, Student> roster = students.findBySectionIdOrderById(sectionId).stream()
            .collect(Collectors.toMap(Student::getId, s -> s));
        int period = timetable.period(sectionId, sub.getId(), date);
        int present = 0;
        int absent = 0;
        Set<String> seen = new HashSet<>();
        for (MarkEntry m : req.marks()) {
            Student s = roster.get(m.studentId());
            if (s == null) throw ApiException.badRequest("Student " + m.studentId() + " is not in this class.");
            if (!seen.add(m.studentId())) throw ApiException.badRequest("Student " + m.studentId() + " is listed twice.");
            Attendance a = attendance.findByStudentIdAndSubjectIdAndDate(s.getId(), sub.getId(), date)
                .orElseGet(Attendance::new);
            a.setStudent(s);
            a.setSubject(sub);
            a.setSection(sec);
            a.setFaculty(f);
            a.setDate(date);
            a.setPeriod(period);
            a.setStatus(m.status());
            attendance.save(a);
            if (m.status() == Status.PRESENT) present++; else absent++;
        }
        attendance.flush();
        int min = props.minimum();
        Map<String, List<Attendance>> byStudent = attendance.findBySectionIdAndSubjectId(sectionId, sub.getId())
            .stream().collect(groupingBy(a -> a.getStudent().getId()));
        List<ShortageAlert> alerts = new ArrayList<>();
        for (Student s : roster.values()) {
            Stat st = stat(byStudent.getOrDefault(s.getId(), List.of()), min);
            if (st.percentage() != null && st.percentage() < min) {
                alerts.add(new ShortageAlert(s.getId(), s.getName(), Math.round(st.percentage() * 10) / 10.0));
            }
        }
        alerts.sort(Comparator.comparing(ShortageAlert::percentage));
        // A notification module would email each alert here. The demo only returns them.
        return new MarkResult(date, present, absent, isWeekend(date), alerts);
    }
}
