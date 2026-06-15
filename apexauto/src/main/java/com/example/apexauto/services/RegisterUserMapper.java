package com.example.apexauto.services;

import com.example.apexauto.DTO.RegisterUserDTO;
import com.example.apexauto.entity.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

// This class is responsible for mapping the RegisterUserDTO to a User entity. It also handles password encoding and setting default values for the new user.

@Component
public class RegisterUserMapper {
    // The variable DefaultRole is a constant that defines the default role assigned to a new user when they register. In this case
    private static final String DEFAULT_ROLE = "USER";

    //This variable creates an object of BCryptPasswordEncoder, which is used to encode the user's password before saving it to the database. This ensures that the password is stored securely and cannot be easily retrieved in plain text.
    private final BCryptPasswordEncoder passwordEncoder;

    // This is the constructor for the RegisterUserMapper class, which initializes the BCryptPasswordEncoder through constructor injection.
    public RegisterUserMapper(BCryptPasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    // This method takes a RegisterUserDTO as input and maps it to a User entity. It encodes the user's password using BCryptPasswordEncoder and sets default values for the new user, such as the default role and the account creation date.
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
