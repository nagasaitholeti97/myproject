package com.sams.controller;

import com.sams.dto.Dtos.Reference;
import com.sams.service.ReferenceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Subjects, classes and the academic calendar. Open to any signed-in user. */
@RestController
@RequestMapping("/api/reference")
public class ReferenceController {

    private final ReferenceService service;

    public ReferenceController(ReferenceService service) {
        this.service = service;
    }

    @GetMapping
    public Reference all() {
        return service.all();
    }
}
