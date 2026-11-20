package com.sams.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One login for both roles. {@code userId} is the student id or the faculty id. */
@Entity
@Getter @Setter @NoArgsConstructor
public class UserAccount {
    @Id
    private String userId;
    @Enumerated(EnumType.STRING)
    private Role role;
    private String passwordHash;

    public UserAccount(String userId, Role role, String passwordHash) {
        this.userId = userId;
        this.role = role;
        this.passwordHash = passwordHash;
    }
}
