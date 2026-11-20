package com.sams.controller;

import com.sams.dto.Dtos.*;
import com.sams.service.StudentService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public StudentProfile me(Principal me) {
        return service.profile(me.getName());
    }

    @PutMapping("/me")
    public StudentProfile update(Principal me, @Valid @RequestBody StudentUpdate body) {
        return service.updateProfile(me.getName(), body);
    }

    /** The student's own attendance rows. */
    @GetMapping("/attendance/records")
    public List<RecordDto> records(Principal me) {
        return service.records(me.getName());
    }

    /** Overall percentage, the five subject cards and the next class test. */
    @GetMapping("/attendance/summary")
    public Summary summary(Principal me) {
        return service.summary(me.getName());
    }

    /** subjectId and month (2026-11) are optional; leave them out for "All". */
    @GetMapping("/attendance/chart")
    public Chart chart(Principal me, @RequestParam(required = false) String subjectId,
                       @RequestParam(required = false) String month) {
        return service.chart(me.getName(), subjectId, month);
    }

    @GetMapping("/attendance/subjects/{subjectId}")
    public SubjectDetail subject(Principal me, @PathVariable String subjectId) {
        return service.subjectDetail(me.getName(), subjectId);
    }

    /** The weekly hourly timetable. weekOffset 0 is the latest week, 1 the week before, and so on. */
    @GetMapping("/attendance/hourly")
    public WeekView hourly(Principal me, @RequestParam(required = false) String subjectId,
                           @RequestParam(required = false) String month,
                           @RequestParam(defaultValue = "0") int weekOffset) {
        return service.hourly(me.getName(), subjectId, month, weekOffset);
    }
}
