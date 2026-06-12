package com.example.apexauto.services;

import com.example.apexauto.DTO.LoginUserDTO;
import com.example.apexauto.DTO.RegisterUserDTO;
import com.example.apexauto.entity.User;
import com.example.apexauto.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
public class AuthenticationService {
    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 3;

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final RegisterUserMapper registerUserMapper;
    private final LoginUserMapper loginUserMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthenticationService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            RegisterUserMapper registerUserMapper,
            LoginUserMapper loginUserMapper,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.registerUserMapper = registerUserMapper;
        this.loginUserMapper = loginUserMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public User signup(RegisterUserDTO input) {
        return userRepository.save(registerUserMapper.toUser(input));
    }

    public User authenticate(LoginUserDTO input) {
        User user = userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isAccountLocked()) {
            throw new IllegalStateException("Account is locked due to too many failed login attempts");
        }

        try {
            authenticationManager.authenticate(loginUserMapper.toAuthenticationToken(input));
        } catch (BadCredentialsException ex) {
            int failedAttempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(failedAttempts);

            if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
                user.setAccountLocked(true);
            }

            userRepository.save(user);

            if (user.isAccountLocked()) {
                throw new IllegalStateException("Account locked after 3 failed login attempts", ex);
            }

            throw ex;
        }

        if (user.getFailedLoginAttempts() > 0) {
            user.setFailedLoginAttempts(0);
            userRepository.save(user);
        }

        return user;
    }

    // Marks the user's email as verified if the token is valid and not expired.
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email verification token"));

        if (user.getEmailVerificationTokenExpiresAt().before(new Date())) {
            throw new IllegalStateException("Email verification token has expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiresAt(null);
        userRepository.save(user);
    }

    // Returns whether the account is enabled and email is verified.
    public User getAccountStatus(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    // Generates a password reset token valid for 1 hour.
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPasswordResetToken(UUID.randomUUID().toString());
        user.setPasswordResetTokenExpiresAt(new Date(System.currentTimeMillis() + 3_600_000L));
        userRepository.save(user);
    }

    // Resets the user's password if the token is valid and not expired.
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset token"));

        if (user.getPasswordResetTokenExpiresAt().before(new Date())) {
            throw new IllegalStateException("Password reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFailedLoginAttempts(0);
        user.setAccountLocked(false);
        user.setPasswordResetToken(UUID.randomUUID().toString());
        user.setPasswordResetTokenExpiresAt(new Date(0L));
        userRepository.save(user);
    }
}
