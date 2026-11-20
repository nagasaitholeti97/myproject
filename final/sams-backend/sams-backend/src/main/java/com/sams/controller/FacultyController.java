package com.sams.controller;

import com.sams.dto.Dtos.*;
import com.sams.service.FacultyService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final FacultyService service;

    public FacultyController(FacultyService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public FacultyProfile me(Principal me) {
        return service.profile(me.getName());
    }

    @PutMapping("/me/contact")
    public FacultyProfile updateContact(Principal me, @Valid @RequestBody ContactUpdate body) {
        return service.updateContact(me.getName(), body);
    }

    /** Every student with basic details. */
    @GetMapping("/students")
    public List<RosterStudent> roster() {
        return service.roster();
    }

    /** Attendance rows of the faculty member's subject, for every class. */
    @GetMapping("/records")
    public List<RecordDto> records(Principal me) {
        return service.records(me.getName());
    }

    @GetMapping("/classes")
    public List<ClassCard> classes(Principal me) {
        return service.classes(me.getName());
    }

    @GetMapping("/classes/{sectionId}/students")
    public List<ClassStudent> students(Principal me, @PathVariable String sectionId) {
        return service.students(me.getName(), sectionId);
    }

    @GetMapping("/classes/{sectionId}/attendance")
    public ClassDay day(Principal me, @PathVariable String sectionId,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.day(me.getName(), sectionId, date);
    }

    /** Saves the marks. The student portal reads the same rows, so absences show up there straight away. */
    @PostMapping("/classes/{sectionId}/attendance")
    public MarkResult mark(Principal me, @PathVariable String sectionId, @Valid @RequestBody MarkRequest body) {
        return service.mark(me.getName(), sectionId, body);
    }
}
