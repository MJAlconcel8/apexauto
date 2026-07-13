package com.example.apexauto.services;

import com.example.apexauto.DTO.LoginUserDTO;
import com.example.apexauto.DTO.RegisterUserDTO;
import com.example.apexauto.entity.User;
import com.example.apexauto.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private RegisterUserMapper registerUserMapper;

    @Mock
    private LoginUserMapper loginUserMapper;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    private AuthenticationService authenticationService;

    @BeforeEach
    void setUp() {
        authenticationService = new AuthenticationService(
                userRepository,
                authenticationManager,
                registerUserMapper,
                loginUserMapper,
                passwordEncoder,
                emailService
        );
    }

    @Test
    void signup_savesMappedUser_andSendsVerificationEmail() {
        RegisterUserDTO input = new RegisterUserDTO("Mark", "Tester", "mark@example.com", "password123");
        User mappedUser = userWithEmail("mark@example.com");
        mappedUser.setEmailVerificationToken("verify-token");

        when(registerUserMapper.toUser(input)).thenReturn(mappedUser);
        when(userRepository.save(mappedUser)).thenReturn(mappedUser);

        User saved = authenticationService.signup(input);

        assertSame(mappedUser, saved);
        verify(userRepository).save(mappedUser);
        verify(emailService).sendEmailVerification("mark@example.com", "verify-token");
    }

    @Test
    void authenticate_throwsWhenUserNotFound() {
        LoginUserDTO input = new LoginUserDTO("missing@example.com", "password123");
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> authenticationService.authenticate(input)
        );

        assertEquals("User not found", ex.getMessage());
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void authenticate_throwsWhenAccountAlreadyLocked() {
        LoginUserDTO input = new LoginUserDTO("locked@example.com", "password123");
        User user = userWithEmail("locked@example.com");
        user.setAccountLocked(true);

        when(userRepository.findByEmail("locked@example.com")).thenReturn(Optional.of(user));

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> authenticationService.authenticate(input)
        );

        assertEquals("Account is locked due to too many failed login attempts", ex.getMessage());
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void authenticate_badCredentialsIncrementsAttempts_andPersists() {
        LoginUserDTO input = new LoginUserDTO("mark@example.com", "bad-pass");
        User user = userWithEmail("mark@example.com");
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken("mark@example.com", "bad-pass");

        when(userRepository.findByEmail("mark@example.com")).thenReturn(Optional.of(user));
        when(loginUserMapper.toAuthenticationToken(input)).thenReturn(token);
        when(authenticationManager.authenticate(token)).thenThrow(new BadCredentialsException("bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authenticationService.authenticate(input));

        assertEquals(1, user.getFailedLoginAttempts());
        assertFalse(user.isAccountLocked());
        verify(userRepository).save(user);
    }

    @Test
    void authenticate_locksAccountOnThirdFailedAttempt() {
        LoginUserDTO input = new LoginUserDTO("mark@example.com", "bad-pass");
        User user = userWithEmail("mark@example.com");
        user.setFailedLoginAttempts(2);
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken("mark@example.com", "bad-pass");

        when(userRepository.findByEmail("mark@example.com")).thenReturn(Optional.of(user));
        when(loginUserMapper.toAuthenticationToken(input)).thenReturn(token);
        when(authenticationManager.authenticate(token)).thenThrow(new BadCredentialsException("bad credentials"));

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> authenticationService.authenticate(input)
        );

        assertEquals("Account locked after 3 failed login attempts", ex.getMessage());
        assertTrue(user.isAccountLocked());
        assertEquals(3, user.getFailedLoginAttempts());
        verify(userRepository).save(user);
    }

    @Test
    void authenticate_resetsFailedAttemptsOnSuccess() {
        LoginUserDTO input = new LoginUserDTO("mark@example.com", "good-pass");
        User user = userWithEmail("mark@example.com");
        user.setFailedLoginAttempts(2);
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken("mark@example.com", "good-pass");

        when(userRepository.findByEmail("mark@example.com")).thenReturn(Optional.of(user));
        when(loginUserMapper.toAuthenticationToken(input)).thenReturn(token);

        User authenticated = authenticationService.authenticate(input);

        assertSame(user, authenticated);
        assertEquals(0, user.getFailedLoginAttempts());
        verify(authenticationManager).authenticate(token);
        verify(userRepository).save(user);
    }

    @Test
    void verifyEmail_marksUserAsVerified_whenTokenIsValid() {
        User user = userWithEmail("mark@example.com");
        user.setEmailVerificationToken("verify-token");
        user.setEmailVerificationTokenExpiresAt(new Date(System.currentTimeMillis() + 60_000));

        when(userRepository.findByEmailVerificationToken("verify-token")).thenReturn(Optional.of(user));

        authenticationService.verifyEmail("verify-token");

        assertTrue(user.isEmailVerified());
        assertNull(user.getEmailVerificationToken());
        assertNull(user.getEmailVerificationTokenExpiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void verifyEmail_throwsWhenTokenIsInvalid() {
        when(userRepository.findByEmailVerificationToken("bad-token")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> authenticationService.verifyEmail("bad-token")
        );

        assertEquals("Invalid email verification token", ex.getMessage());
    }

    @Test
    void forgotPassword_setsTokenAndExpiry_andSendsEmail() {
        User user = userWithEmail("mark@example.com");
        when(userRepository.findByEmail("mark@example.com")).thenReturn(Optional.of(user));

        authenticationService.forgotPassword("mark@example.com");

        assertNotNull(user.getPasswordResetToken());
        assertTrue(user.getPasswordResetTokenExpiresAt().after(new Date()));
        verify(userRepository).save(user);
        verify(emailService).sendPasswordReset("mark@example.com", user.getPasswordResetToken());
    }

    @Test
    void resetPassword_updatesPasswordAndUnlocksAccount() {
        User user = userWithEmail("mark@example.com");
        user.setPasswordResetToken("reset-token");
        user.setPasswordResetTokenExpiresAt(new Date(System.currentTimeMillis() + 60_000));
        user.setFailedLoginAttempts(3);
        user.setAccountLocked(true);

        when(userRepository.findByPasswordResetToken("reset-token")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPass123!")).thenReturn("encoded-password");

        authenticationService.resetPassword("reset-token", "NewPass123!");

        assertEquals("encoded-password", user.getPassword());
        assertEquals(0, user.getFailedLoginAttempts());
        assertFalse(user.isAccountLocked());
        assertNotNull(user.getPasswordResetToken());
        assertNotEquals("reset-token", user.getPasswordResetToken());
        assertEquals(new Date(0L), user.getPasswordResetTokenExpiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void resetPassword_throwsWhenTokenExpired() {
        User user = userWithEmail("mark@example.com");
        user.setPasswordResetToken("reset-token");
        user.setPasswordResetTokenExpiresAt(new Date(System.currentTimeMillis() - 1_000));

        when(userRepository.findByPasswordResetToken("reset-token")).thenReturn(Optional.of(user));

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> authenticationService.resetPassword("reset-token", "NewPass123!")
        );

        assertEquals("Password reset token has expired", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    private User userWithEmail(String email) {
        User user = new User();
        user.setEmail(email);
        user.setAccountEnabled(true);
        user.setEmailVerified(true);
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);
        return user;
    }
}

