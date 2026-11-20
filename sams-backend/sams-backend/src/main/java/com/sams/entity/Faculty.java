package com.sams.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor
public class Faculty {
    @Id
    private String id;
    private String name;
    private String gender;
    private Integer age;
    private String designation;
    private String qualification;
    private Integer experience;
    private String department;
    private String phone;
    private String email;
    /** Each faculty member teaches one subject. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Subject subject;
}
