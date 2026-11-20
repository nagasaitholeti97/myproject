package com.sams.config;

import com.sams.domain.Periods;
import com.sams.entity.*;
import com.sams.repository.*;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inserts the same sample data the website demo used: 3 classes, 5 subjects, 5 faculty, 24 students, a calendar and
 * attendance from 14 Sep up to the day before "today". It only runs when the tables are empty.
 * Every demo account uses the password demo123. Turn it off with sams.seed-demo-data=false.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final String DEPT = "Electronics & Communication Engineering";
    private static final String[] COLONY = {"Madhapur", "Gandhi Nagar", "Ashok Nagar", "Srinivasa Colony", "Vidya Nagar",
        "Balaji Nagar", "Green Park", "Shanti Nagar"};
    private static final Map<String, String> CITY_PIN = Map.of("Hyderabad", "500081", "Warangal", "506002",
        "Karimnagar", "505001", "Vijayawada", "520010", "Guntur", "522002", "Nizamabad", "503001");

    /** section, name, gender, father, mother, city, how likely the student is to be present */
    private record Raw(String section, String name, char gender, String father, String mother, String city,
                       double tendency) {}

    private static final List<Raw> RAW = List.of(
        new Raw("SEC1", "Aarav Sharma", 'M', "Rajesh Sharma", "Sunita Sharma", "Hyderabad", 0.95),
        new Raw("SEC1", "Diya Patel", 'F', "Mahesh Patel", "Kiran Patel", "Warangal", 0.88),
        new Raw("SEC1", "Rohan Naidu", 'M', "Venkat Naidu", "Padma Naidu", "Vijayawada", 0.82),
        new Raw("SEC1", "Sneha Iyer", 'F', "Subramanian Iyer", "Lakshmi Iyer", "Hyderabad", 0.7),
        new Raw("SEC1", "Karthik Goud", 'M', "Narsimha Goud", "Saritha Goud", "Karimnagar", 0.93),
        new Raw("SEC1", "Meera Joshi", 'F', "Anil Joshi", "Neelam Joshi", "Hyderabad", 0.66),
        new Raw("SEC1", "Vikram Singh", 'M', "Harpal Singh", "Jaswinder Kaur", "Nizamabad", 0.86),
        new Raw("SEC1", "Pooja Das", 'F', "Biswas Das", "Rina Das", "Guntur", 0.78),
        new Raw("SEC2", "Arjun Reddy", 'M', "Sudhakar Reddy", "Vimala Reddy", "Hyderabad", 0.91),
        new Raw("SEC2", "Ishita Gupta", 'F', "Manoj Gupta", "Rekha Gupta", "Hyderabad", 0.85),
        new Raw("SEC2", "Harsha Vardhan", 'M', "Ramana Rao", "Jyothi Rao", "Guntur", 0.74),
        new Raw("SEC2", "Nikhil Kumar", 'M', "Prasad Kumar", "Latha Kumar", "Warangal", 0.96),
        new Raw("SEC2", "Priya Menon", 'F', "Gopal Menon", "Radha Menon", "Vijayawada", 0.8),
        new Raw("SEC2", "Sai Teja", 'M', "Srinivas Rao", "Anitha Rao", "Karimnagar", 0.68),
        new Raw("SEC2", "Fatima Khan", 'F', "Abdul Khan", "Shabana Khan", "Hyderabad", 0.89),
        new Raw("SEC2", "Tarun Yadav", 'M', "Dinesh Yadav", "Kamala Yadav", "Nizamabad", 0.77),
        new Raw("SEC3", "Rahul Verma", 'M', "Sanjay Verma", "Anita Verma", "Warangal", 0.9),
        new Raw("SEC3", "Ananya Rao", 'F', "Krishna Rao", "Madhavi Rao", "Hyderabad", 0.72),
        new Raw("SEC3", "Sravani Chowdary", 'F', "Nageswara Chowdary", "Durga Chowdary", "Vijayawada", 0.94),
        new Raw("SEC3", "Mohit Agarwal", 'M', "Vinod Agarwal", "Seema Agarwal", "Hyderabad", 0.83),
        new Raw("SEC3", "Lavanya Pillai", 'F', "Mohan Pillai", "Geetha Pillai", "Guntur", 0.87),
        new Raw("SEC3", "Kiran Kumar", 'M', "Raju Kumar", "Bhavani Kumar", "Karimnagar", 0.79),
        new Raw("SEC3", "Divya Thakur", 'F', "Ashok Thakur", "Meena Thakur", "Hyderabad", 0.92),
        new Raw("SEC3", "Yash Mehta", 'M', "Paresh Mehta", "Hetal Mehta", "Nizamabad", 0.65));

    /** faculty id, subject id, name, age, gender, qualification, designation, experience */
    private static final String[][] FACULTY = {
        {"F101", "SUB102", "Dr. Anjali Rao", "41", "Female", "Ph.D. (VLSI Design)", "Associate Professor", "14"},
        {"F102", "SUB101", "Prof. Suresh Varma", "52", "Male", "Ph.D. (Signal Processing)", "Professor", "26"},
        {"F103", "SUB103", "Dr. Kavitha Reddy", "36", "Female", "Ph.D. (Circuit Theory)", "Assistant Professor", "9"},
        {"F104", "SUB104", "Mr. Imran Sheikh", "33", "Male", "M.Tech (Microelectronics)", "Assistant Professor", "7"},
        {"F105", "SUB105", "Dr. Lakshmi Prasad", "45", "Female", "Ph.D. (Applied Mathematics)", "Associate Professor", "18"}};

    /** Same random numbers as the website's sample data (mulberry32), so both show the same attendance. */
    private static final class Rng {
        private int a;

        Rng(int seed) {
            a = seed;
        }

        double next() {
            a += 0x6d2b79f5;
            int t = (a ^ (a >>> 15)) * (1 | a);
            t = (t + ((t ^ (t >>> 7)) * (61 | t))) ^ t;
            return ((t ^ (t >>> 14)) & 0xffffffffL) / 4294967296.0;
        }
    }

    private final boolean enabled;
    private final SamsProperties props;
    private final SectionRepository sections;
    private final SubjectRepository subjects;
    private final StudentRepository students;
    private final FacultyRepository faculty;
    private final UserAccountRepository accounts;
    private final AcademicEventRepository events;
    private final AttendanceRepository attendance;
    private final PasswordEncoder encoder;

    public DataSeeder(@Value("${sams.seed-demo-data:true}") boolean enabled, SamsProperties props,
                      SectionRepository sections, SubjectRepository subjects, StudentRepository students,
                      FacultyRepository faculty, UserAccountRepository accounts, AcademicEventRepository events,
                      AttendanceRepository attendance, PasswordEncoder encoder) {
        this.enabled = enabled;
        this.props = props;
        this.sections = sections;
        this.subjects = subjects;
        this.students = students;
        this.faculty = faculty;
        this.accounts = accounts;
        this.events = events;
        this.attendance = attendance;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled || sections.count() > 0) return;
        String hash = encoder.encode("demo123");

        List<Section> secs = sections.saveAll(List.of(
            new Section("SEC1", "1st Year ECE-C", 1, DEPT, "B.Tech", "26ECE1"),
            new Section("SEC2", "2nd Year ECE-B", 2, DEPT, "B.Tech", "25ECE2"),
            new Section("SEC3", "3rd Year ECE-A", 3, DEPT, "B.Tech", "24ECE3")));
        int[] birthYear = {2008, 2007, 2006};

        List<Subject> subs = subjects.saveAll(List.of(
            new Subject("SUB101", "ECE201", "Signals & Systems"),
            new Subject("SUB102", "ECE202", "Digital Electronics"),
            new Subject("SUB103", "ECE203", "Network Theory"),
            new Subject("SUB104", "ECE204", "Analog Circuits"),
            new Subject("SUB105", "MAT201", "Engineering Mathematics")));

        List<Faculty> facultyList = new ArrayList<>();
        for (String[] r : FACULTY) {
            Faculty f = new Faculty();
            f.setId(r[0]);
            f.setSubject(subs.stream().filter(s -> s.getId().equals(r[1])).findFirst().orElseThrow());
            f.setName(r[2]);
            f.setAge(Integer.parseInt(r[3]));
            f.setGender(r[4]);
            f.setQualification(r[5]);
            f.setDesignation(r[6]);
            f.setExperience(Integer.parseInt(r[7]));
            f.setEmail(r[2].replaceFirst("^(Dr|Prof|Mr)\\.\\s*", "").toLowerCase().replace(" ", ".") + "@campus.edu");
            f.setPhone("98480" + String.format("%05d", Integer.parseInt(r[0].substring(1))));
            f.setDepartment(DEPT);
            facultyList.add(f);
            accounts.save(new UserAccount(f.getId(), Role.FACULTY, hash));
        }
        facultyList = faculty.saveAll(facultyList);

        List<Student> studentList = new ArrayList<>();
        int[] counter = new int[3];
        for (int i = 0; i < RAW.size(); i++) {
            Raw r = RAW.get(i);
            int si = Integer.parseInt(r.section().substring(3)) - 1;
            Section sec = secs.get(si);
            counter[si]++;
            Student s = new Student();
            s.setId(sec.getIdPrefix() + String.format("%03d", counter[si]));
            s.setName(r.name());
            s.setGender(r.gender() == 'M' ? "Male" : "Female");
            s.setDateOfBirth(LocalDate.of(birthYear[si], 1 + ((i * 5) % 12), 3 + ((i * 7) % 25)));
            s.setPhone("98480" + (10200 + i * 137));
            s.setEmail(r.name().toLowerCase().replace(" ", ".") + "@student.campus.edu");
            s.setFatherName(r.father());
            s.setMotherName(r.mother());
            s.setAddress("H.No " + (10 + i * 3) + "-" + (2 + i) + "/" + (1 + (i % 4)) + ", " + COLONY[i % 8]);
            s.setCity(r.city());
            s.setPincode(CITY_PIN.get(r.city()));
            s.setDepartment(DEPT);
            s.setCourse("B.Tech");
            s.setSection(sec);
            studentList.add(s);
            accounts.save(new UserAccount(s.getId(), Role.STUDENT, hash));
        }
        studentList = students.saveAll(studentList);

        events.saveAll(List.of(
            new AcademicEvent("TERM-5", "Semester 5", EventType.SEMESTER, LocalDate.of(2026, 8, 17), LocalDate.of(2026, 12, 12), "2026-27", null),
            new AcademicEvent("HOL-01", "Dussehra holiday", EventType.HOLIDAY, LocalDate.of(2026, 10, 20), LocalDate.of(2026, 10, 20), "2026-27", null),
            new AcademicEvent("HOL-02", "Diwali holiday", EventType.HOLIDAY, LocalDate.of(2026, 11, 8), LocalDate.of(2026, 11, 8), "2026-27", null),
            new AcademicEvent("CT-102", "Class test: Digital Electronics", EventType.CLASS_TEST, LocalDate.of(2026, 11, 12), LocalDate.of(2026, 11, 12), "2026-27", subs.get(1)),
            new AcademicEvent("EVT-01", "Parent-teacher meeting", EventType.EVENT, LocalDate.of(2026, 11, 14), LocalDate.of(2026, 11, 14), "2026-27", null),
            new AcademicEvent("AS-101", "Assignment due: Signals & Systems", EventType.ASSIGNMENT, LocalDate.of(2026, 11, 16), LocalDate.of(2026, 11, 16), "2026-27", subs.get(0)),
            new AcademicEvent("AS-104", "Lab record submission", EventType.ASSIGNMENT, LocalDate.of(2026, 11, 18), LocalDate.of(2026, 11, 18), "2026-27", subs.get(3)),
            new AcademicEvent("CT-103", "Class test: Network Theory", EventType.CLASS_TEST, LocalDate.of(2026, 11, 19), LocalDate.of(2026, 11, 19), "2026-27", subs.get(2)),
            new AcademicEvent("EX-01", "Mid-semester exams", EventType.EXAM, LocalDate.of(2026, 11, 23), LocalDate.of(2026, 11, 28), "2026-27", null),
            new AcademicEvent("EVT-02", "Annual sports meet", EventType.EVENT, LocalDate.of(2026, 12, 3), LocalDate.of(2026, 12, 4), "2026-27", null),
            new AcademicEvent("EVT-03", "Technical symposium", EventType.EVENT, LocalDate.of(2026, 12, 10), LocalDate.of(2026, 12, 10), "2026-27", null),
            new AcademicEvent("EX-02", "End-semester exams", EventType.EXAM, LocalDate.of(2026, 12, 21), LocalDate.of(2027, 1, 5), "2026-27", null),
            new AcademicEvent("HOL-03", "Christmas", EventType.HOLIDAY, LocalDate.of(2026, 12, 25), LocalDate.of(2026, 12, 25), "2026-27", null),
            new AcademicEvent("HOL-04", "Sankranti break", EventType.HOLIDAY, LocalDate.of(2027, 1, 13), LocalDate.of(2027, 1, 17), "2026-27", null),
            new AcademicEvent("HOL-05", "Republic Day", EventType.HOLIDAY, LocalDate.of(2027, 1, 26), LocalDate.of(2027, 1, 26), "2026-27", null)));

        // Attendance from 14 Sep to the day before "today". About two of every three weekdays have a class per subject.
        List<LocalDate> days = new ArrayList<>();
        LocalDate end = props.today().minusDays(1);
        for (LocalDate d = LocalDate.of(2026, 9, 14); !d.isAfter(end); d = d.plusDays(1)) {
            if (d.getDayOfWeek() != DayOfWeek.SATURDAY && d.getDayOfWeek() != DayOfWeek.SUNDAY
                && !d.equals(LocalDate.of(2026, 10, 20))) days.add(d);
        }
        double[] modifier = {0, 0.04, -0.05, 0.02, -0.03};
        Rng rand = new Rng(2610);
        List<Attendance> rows = new ArrayList<>();
        for (int si = 0; si < secs.size(); si++) {
            Section sec = secs.get(si);
            for (int k = 0; k < subs.size(); k++) {
                Subject sub = subs.get(k);
                Faculty f = facultyList.stream().filter(x -> x.getSubject().getId().equals(sub.getId())).findFirst().orElseThrow();
                List<Student> list = new ArrayList<>();
                for (int i = 0; i < studentList.size(); i++) {
                    if (studentList.get(i).getSection().getId().equals(sec.getId())) list.add(studentList.get(i));
                }
                for (int i = 0; i < days.size(); i++) {
                    if ((i + k + si) % 3 == 0) continue; // no class in this hour on this day
                    LocalDate day = days.get(i);
                    for (Student s : list) {
                        double tendency = RAW.get(studentList.indexOf(s)).tendency();
                        double p = Math.min(0.99, Math.max(0.4, tendency + modifier[k]));
                        Attendance a = new Attendance();
                        a.setStudent(s);
                        a.setSubject(sub);
                        a.setSection(sec);
                        a.setFaculty(f);
                        a.setDate(day);
                        a.setPeriod(Periods.periodOf(si, k, day));
                        a.setStatus(rand.next() < p ? Status.PRESENT : Status.ABSENT);
                        rows.add(a);
                    }
                }
            }
        }
        attendance.saveAll(rows);
    }
}
