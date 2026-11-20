package com.sams.repository;

import com.sams.entity.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, String> {
    List<Student> findBySectionIdOrderById(String sectionId);

    List<Student> findAllByOrderById();

    Optional<Student> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countBySectionId(String sectionId);
}
