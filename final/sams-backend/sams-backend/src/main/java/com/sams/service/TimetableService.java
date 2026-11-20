package com.sams.service;

import com.sams.domain.Periods;
import com.sams.entity.Section;
import com.sams.entity.Subject;
import com.sams.repository.SectionRepository;
import com.sams.repository.SubjectRepository;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TimetableService {

    private final SectionRepository sections;
    private final SubjectRepository subjects;

    public TimetableService(SectionRepository sections, SubjectRepository subjects) {
        this.sections = sections;
        this.subjects = subjects;
    }

    public List<Subject> orderedSubjects() {
        return subjects.findAll().stream().sorted(Comparator.comparing(Subject::getId)).toList();
    }

    public int period(String sectionId, String subjectId, LocalDate date) {
        List<String> sIds = sections.findAll().stream().map(Section::getId).sorted().toList();
        List<String> subIds = orderedSubjects().stream().map(Subject::getId).toList();
        return Periods.periodOf(Math.max(0, sIds.indexOf(sectionId)), Math.max(0, subIds.indexOf(subjectId)), date);
    }
}
