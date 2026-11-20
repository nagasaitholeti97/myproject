package com.sams.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor
public class Section {
    @Id
    private String id;
    private String name;
    /** 1, 2 or 3 */
    @Column(name = "study_year")
    private int year;
    private String department;
    private String course;
    /** Start of the student IDs of this class, for example 24ECE3 gives 24ECE3001. */
    private String idPrefix;

    public Section(String id, String name, int year, String department, String course, String idPrefix) {
        this.id = id;
        this.name = name;
        this.year = year;
        this.department = department;
        this.course = course;
        this.idPrefix = idPrefix;
    }
}
