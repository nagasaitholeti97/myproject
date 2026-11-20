package com.sams.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor
public class AcademicEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    /** Short code such as CT-102. */
    private String code;
    private String title;
    @Enumerated(EnumType.STRING)
    private EventType type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String academicYear;
    @ManyToOne(fetch = FetchType.LAZY)
    private Subject subject;

    public AcademicEvent(String code, String title, EventType type, LocalDate startDate, LocalDate endDate,
                         String academicYear, Subject subject) {
        this.code = code;
        this.title = title;
        this.type = type;
        this.startDate = startDate;
        this.endDate = endDate;
        this.academicYear = academicYear;
        this.subject = subject;
    }
}
