package com.sams.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor
public class Student {
    @Id
    private String id;
    private String name;
    private String gender;
    private LocalDate dateOfBirth;
    private String phone;
    private String email;
    private String fatherName;
    private String motherName;
    private String address;
    private String city;
    private String pincode;
    private String department;
    private String course;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Section section;
}
