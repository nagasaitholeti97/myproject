package com.sams.service;

import com.sams.config.SamsProperties;
import com.sams.dto.Dtos.*;
import com.sams.entity.Section;
import com.sams.entity.Subject;
import com.sams.repository.AcademicEventRepository;
import com.sams.repository.SectionRepository;
import com.sams.repository.SubjectRepository;
import java.util.Comparator;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReferenceService {

    private final SubjectRepository subjects;
    private final SectionRepository sections;
    private final AcademicEventRepository events;
    private final SamsProperties props;

    public ReferenceService(SubjectRepository subjects, SectionRepository sections, AcademicEventRepository events,
                            SamsProperties props) {
        this.subjects = subjects;
        this.sections = sections;
        this.events = events;
        this.props = props;
    }

    public Reference all() {
        return new Reference(
            subjects.findAll().stream().sorted(Comparator.comparing(Subject::getId))
                .map(s -> new SubjectDto(s.getId(), s.getCode(), s.getName())).toList(),
            sections.findAll().stream().sorted(Comparator.comparing(Section::getId))
                .map(s -> new SectionDto(s.getId(), s.getName(), s.getYear(), s.getDepartment(), s.getCourse())).toList(),
            events.findAll(Sort.by("startDate", "id")).stream().map(StudentService::toDto).toList(),
            props.today());
    }
}
