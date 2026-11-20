package com.sams.repository;

import com.sams.entity.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(String studentId);

    List<Attendance> findBySubjectId(String subjectId);

    List<Attendance> findBySectionIdAndSubjectId(String sectionId, String subjectId);

    List<Attendance> findBySectionIdAndSubjectIdAndDate(String sectionId, String subjectId, LocalDate date);

    Optional<Attendance> findByStudentIdAndSubjectIdAndDate(String studentId, String subjectId, LocalDate date);
}
