package com.sams.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor
public class Subject {
    @Id
    private String id;
    private String code;
    private String name;

    public Subject(String id, String code, String name) {
        this.id = id;
        this.code = code;
        this.name = name;
    }
}
