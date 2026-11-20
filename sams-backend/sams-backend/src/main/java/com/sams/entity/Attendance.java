package com.sams.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One row per student, subject and day. {@code period} is the hour of the day, 0 to 4. */
@Entity
@Table(
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "subject_id", "class_date"}),
    indexes = {@Index(columnList = "student_id"), @Index(columnList = "section_id, subject_id, class_date")})
@Getter @Setter @NoArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Student student;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Subject subject;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Section section;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Faculty faculty;
    @Column(name = "class_date")
    private LocalDate date;
    private int period;
    @Enumerated(EnumType.STRING)
    private Status status;
}
