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

// This class is responsible for handling authentication-related operations, such as registering new users and authenticating existing users. It interacts with the UserRepository to manage user data and uses the JwtService to generate JWT tokens for authenticated users.
public class AuthenticationService {

    // This variable is used to interact with the UserRepository, which provides methods for accessing and managing user data in the database.
    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 3;

    // This variable creates an object of UserRepository, which is used to perform database operations related to the User entity, such as saving new users and retrieving existing users based on their email or tokens.
    private final UserRepository userRepository;

    // This variable creates an object of AuthenticationManager, which is used to authenticate user credentials during the login process.
    private final AuthenticationManager authenticationManager;

    // This variable creates a RegisterUserMapper, which is responsible for mapping the RegisterUserDTO to a User entity, including handling password encoding and setting default values for new users.
    private final RegisterUserMapper registerUserMapper;

    // This variable creates a LoginUserMapper, which is responsible for mapping the LoginUserDTO to a UsernamePasswordAuthenticationToken, which is used by Spring Security to perform authentication.
    private final LoginUserMapper loginUserMapper;

    // This variable creates a JwtService, which is responsible for generating JWT tokens for authenticated users, allowing them to access protected resources in the application.
    private final BCryptPasswordEncoder passwordEncoder;

    // This is the constructor for the AuthenticationService class, which initializes all the required dependencies through constructor injection.
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

    // This method is responsible for registering a new user. It takes a RegisterUserDTO as input, maps it to a User entity, and saves it to the database. It also handles password encoding and sets default values for the new user.
    public User signup(RegisterUserDTO input) {
        return userRepository.save(registerUserMapper.toUser(input));
    }

    // This method is responsible for authenticating an existing user. It takes a LoginUserDTO as input, maps it to a UsernamePasswordAuthenticationToken, and uses the AuthenticationManager to authenticate the user's credentials. If authentication is successful, it generates a JWT token for the user.
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
