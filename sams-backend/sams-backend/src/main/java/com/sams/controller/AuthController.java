package com.sams.controller;

import com.sams.dto.Dtos.*;
import com.sams.service.AuthService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse register(@Valid @RequestBody RegisterRequest req) {
        return auth.register(req);
    }

    @PostMapping("/register-faculty")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse registerFaculty(@Valid @RequestBody RegisterFacultyRequest req) {
        return auth.registerFaculty(req);
    }

    /** Step 1 of the change-password pop-up: is this my current password? */
    @PostMapping("/verify-password")
    public Message verifyPassword(Principal me, @Valid @RequestBody VerifyPasswordRequest req) {
        return auth.verifyPassword(me.getName(), req);
    }

    @PostMapping("/forgot")
    public Message forgot(@Valid @RequestBody ForgotRequest req) {
        return auth.forgot(req);
    }

    @PostMapping("/change-password")
    public Message changePassword(Principal me, @Valid @RequestBody ChangePasswordRequest req) {
        return auth.changePassword(me.getName(), req);
    }
}
