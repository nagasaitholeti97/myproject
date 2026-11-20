package com.sams.dto;

import com.sams.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public final class Dtos {

    private Dtos() {}

    // ---------- auth
    /** {@code userId} may be the student or faculty ID, or the email address. */
    public record LoginRequest(@NotBlank String userId, @NotBlank String password) {}

    public record LoginResponse(String token, Role role, String userId, String name) {}

    public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 100) String name,
        String gender,
        @NotBlank String sectionId,
        @NotBlank @Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits") String phone,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 72, message = "Password needs at least 8 characters.") String password) {}

    public record RegisterFacultyRequest(
        @NotBlank @Size(min = 2, max = 100) String name,
        String gender,
        @NotBlank String subjectId,
        String designation,
        String qualification,
        @NotBlank @Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits") String phone,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 72, message = "Password needs at least 8 characters.") String password) {}

    /** ID or email. */
    public record ForgotRequest(@NotBlank String identifier) {}

    public record VerifyPasswordRequest(@NotBlank String password) {}

    public record ChangePasswordRequest(@NotBlank String currentPassword,
                                        @NotBlank @Size(min = 8, max = 72, message = "New password needs at least 8 characters.") String newPassword) {}

    public record Message(String message) {}

    public record ContactUpdate(
        @NotBlank @Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits") String phone,
        @NotBlank @Email String email) {}

    public record StudentUpdate(
        LocalDate dateOfBirth,
        String fatherName,
        String motherName,
        @NotBlank @Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits") String phone,
        @NotBlank @Email String email,
        String address,
        String city,
        @Pattern(regexp = "^$|\\d{6}", message = "Pincode must be 6 digits") String pincode) {}

    // ---------- reference data (same for everyone who is signed in)
    public record SubjectDto(String id, String code, String name) {}

    public record SectionDto(String id, String name, int year, String department, String course) {}

    public record Reference(List<SubjectDto> subjects, List<SectionDto> sections, List<EventDto> events, LocalDate today) {}

    // ---------- profiles
    public record StudentProfile(String studentId, String name, String gender, LocalDate dateOfBirth, String phone,
                                 String email, String fatherName, String motherName, String address, String city,
                                 String pincode, String department, String course, String sectionId,
                                 String sectionName, int year) {}

    public record FacultyProfile(String facultyId, String name, String gender, Integer age, String designation,
                                 String qualification, Integer experience, String department, String phone,
                                 String email, String subjectId, String subjectName, String subjectCode) {}

    /** One attendance row, as stored. The website calculates its own percentages from these. */
    public record RecordDto(Long id, String studentId, String facultyId, String sectionId, String subjectId,
                            LocalDate date, int period, String status) {}

    public record RosterStudent(String id, String name, String phone, String email, String sectionId) {}

    // ---------- attendance (student)
    public record SubjectStat(String subjectId, String subjectCode, String subjectName, String facultyName,
                              int held, int attended, int absent, Double percentage, String level,
                              boolean eligible, int classesNeeded, int canMiss) {}

    public record EventDto(Long id, String code, String title, String type, LocalDate startDate, LocalDate endDate,
                           String academicYear, String subjectId, String subjectName) {}

    public record Summary(Double overallPercentage, int held, int attended, int minimum, int subjectsBelowMinimum,
                          int eligibleSubjects, EventDto nextEvent, List<SubjectStat> subjects) {}

    public record ChartRow(String label, int held, int attended, Double percentage, String mode,
                           boolean belowMinimum) {}

    public record Chart(String title, int minimum, List<String> months, List<ChartRow> rows) {}

    public record SubjectDetail(SubjectStat stat, String facultyEmail, String facultyDesignation,
                                String sectionName, List<UsualHour> usualHours) {}

    public record UsualHour(String day, int period, String time) {}

    public record Slot(int period, String time, String subjectId, String subjectName, String status) {}

    public record DayRow(LocalDate date, String day, List<Slot> slots) {}

    public record WeekView(int weekOffset, int weekCount, LocalDate weekStart, LocalDate weekEnd,
                           List<String> periods, List<DayRow> days) {}

    // ---------- faculty
    public record ClassCard(String sectionId, String sectionName, int year, int students, Double classAverage,
                            String level, int belowMinimum) {}

    public record ClassStudent(String studentId, String name, String phone, int held, int attended,
                               Double percentage, String level) {}

    public record MarkEntry(@NotBlank String studentId, @NotNull com.sams.entity.Status status) {}

    public record MarkRequest(@NotNull LocalDate date, @NotEmpty List<@jakarta.validation.Valid MarkEntry> marks) {}

    public record ClassDay(String sectionId, LocalDate date, boolean alreadySaved, boolean weekend,
                           List<MarkEntry> marks) {}

    public record ShortageAlert(String studentId, String name, double percentage) {}

    public record MarkResult(LocalDate date, int present, int absent, boolean weekend, List<ShortageAlert> alerts) {}
}
