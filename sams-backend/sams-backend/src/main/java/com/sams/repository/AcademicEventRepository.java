package com.sams.repository;

import com.sams.entity.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicEventRepository extends JpaRepository<AcademicEvent, Long> {
    List<AcademicEvent> findByStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDate(LocalDate end, LocalDate start);

    List<AcademicEvent> findByTypeNotAndEndDateGreaterThanEqualOrderByStartDate(EventType type, LocalDate from);

    List<AcademicEvent> findByType(EventType type);
}
