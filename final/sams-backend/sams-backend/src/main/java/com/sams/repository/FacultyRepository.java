package com.sams.repository;

import com.sams.entity.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacultyRepository extends JpaRepository<Faculty, String> {
    Optional<Faculty> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
