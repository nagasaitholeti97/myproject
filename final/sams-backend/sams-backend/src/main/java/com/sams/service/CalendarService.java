package com.sams.service;

import com.sams.dto.Dtos.EventDto;
import com.sams.entity.EventType;
import com.sams.exception.ApiException;
import com.sams.repository.AcademicEventRepository;
import java.time.YearMonth;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CalendarService {

    private final AcademicEventRepository events;

    public CalendarService(AcademicEventRepository events) {
        this.events = events;
    }

    /** Events that overlap the month, for example month=2026-11. The semester itself is not listed. */
    public List<EventDto> month(String month) {
        YearMonth m;
        try {
            m = YearMonth.parse(month);
        } catch (RuntimeException e) {
            throw ApiException.badRequest("Month must look like 2026-11.");
        }
        return events.findByStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDate(m.atEndOfMonth(), m.atDay(1))
            .stream().filter(e -> e.getType() != EventType.SEMESTER).map(StudentService::toDto).toList();
    }

    public EventDto term() {
        return events.findByType(EventType.SEMESTER).stream().findFirst().map(StudentService::toDto)
            .orElseThrow(() -> ApiException.notFound("Term"));
    }
}
