package com.example.apexauto.services;

import com.example.apexauto.DTO.RegisterUserDTO;
import com.example.apexauto.entity.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Component
public class RegisterUserMapper {
    private static final String DEFAULT_ROLE = "USER";

    private final BCryptPasswordEncoder passwordEncoder;

    public RegisterUserMapper(BCryptPasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public User toUser(RegisterUserDTO registerUserDTO) {
        User user = new User();

        user.setFirstName(registerUserDTO.getFirstName());
        user.setLastName(registerUserDTO.getLastName());
        user.setEmail(registerUserDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerUserDTO.getPassword()));
        user.setRoleName(DEFAULT_ROLE);

        user.setEmailVerified(false);
        user.setAccountEnabled(true);
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);

        user.setPasswordResetToken(UUID.randomUUID().toString());
        // Keep token expired until an explicit reset flow issues a valid one.
        user.setPasswordResetTokenExpiresAt(new Date(0L));

        // Email verification token valid for 24 hours.
        user.setEmailVerificationToken(UUID.randomUUID().toString());
        user.setEmailVerificationTokenExpiresAt(new Date(System.currentTimeMillis() + 86_400_000L));

        return user;
    }
}
