package com.sams.controller;

import com.sams.dto.Dtos.EventDto;
import com.sams.service.CalendarService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Open to any signed-in user, student or faculty. */
@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarService service;

    public CalendarController(CalendarService service) {
        this.service = service;
    }

    @GetMapping
    public List<EventDto> month(@RequestParam String month) {
        return service.month(month);
    }

    @GetMapping("/term")
    public EventDto term() {
        return service.term();
    }
}
