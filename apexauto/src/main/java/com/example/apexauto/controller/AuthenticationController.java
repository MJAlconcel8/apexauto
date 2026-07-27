package com.example.apexauto.controller;

import com.example.apexauto.DTO.*;
import com.example.apexauto.entity.User;
import com.example.apexauto.exceptions.EmailNotVerifiedException;
import com.example.apexauto.services.AuthenticationService;
import com.example.apexauto.services.JWTService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final JWTService jwtService;

    public AuthenticationController(AuthenticationService authenticationService, JWTService jwtService) {
        this.authenticationService = authenticationService;
        this.jwtService = jwtService;
    }

    // POST /auth/register — creates a new user account and returns the email verification token directly
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(@RequestBody RegisterUserDTO registerUserDTO) {
        User registeredUser = authenticationService.signup(registerUserDTO);
        return ResponseEntity.ok(new RegisterResponseDTO(registeredUser, registeredUser.getEmailVerificationToken()));
    }

    // POST /auth/login — authenticates credentials, sets JWT as httpOnly cookie, and returns user info.
    // Responds with a LoginErrorDTO (including a "code") on failure so the frontend can react to
    // specific cases, such as redirecting to email verification instead of showing a generic error.
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginUserDTO loginUserDTO) {
        try {
            User authenticatedUser = authenticationService.authenticate(loginUserDTO);
            LoginResponseDTO response = new LoginResponseDTO(jwtService.getExpirationTime(), authenticatedUser.getUserId());

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, createJwtCookie(authenticatedUser).toString())
                    .body(response);
        } catch (EmailNotVerifiedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new LoginErrorDTO("Please verify your email address before signing in.", "EMAIL_NOT_VERIFIED"));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginErrorDTO("Incorrect email or password.", "INVALID_CREDENTIALS"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginErrorDTO("Incorrect email or password.", "INVALID_CREDENTIALS"));
        } catch (IllegalStateException ex) {
            String message = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
            String code = message.contains("disabled") ? "ACCOUNT_DISABLED" : "ACCOUNT_LOCKED";
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new LoginErrorDTO(ex.getMessage(), code));
        }
    }

    // Returns the signed-in user.
    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUserDTO> currentUser(@AuthenticationPrincipal User authenticatedUser) {
        return ResponseEntity.ok(AuthenticatedUserDTO.from(authenticatedUser));
    }

    // PATCH /auth/me — updates the signed-in user's first name, last name, and/or email.
    // Changing the email marks it unverified again and sends a new verification token.
    @PatchMapping("/me")
    public ResponseEntity<AuthenticatedUserDTO> updateProfile(
            @AuthenticationPrincipal User authenticatedUser,
            @RequestBody UpdateProfileDTO updateProfileDTO
    ) {
        try {
            User updatedUser = authenticationService.updateProfile(authenticatedUser, updateProfileDTO);
            return ResponseEntity.ok(AuthenticatedUserDTO.from(updatedUser));
        } catch (IllegalArgumentException ex) {
            HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("already in use")
                    ? HttpStatus.CONFLICT
                    : HttpStatus.BAD_REQUEST;
            throw new ResponseStatusException(status, ex.getMessage(), ex);
        }
    }

    // POST /auth/logout — clears the JWT cookie
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie clearCookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .build();
    }

    // GET /auth/verify-email?token= — verifies the user's email using the token sent on registration
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        authenticationService.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully");
    }

    // GET /auth/account-status?email= — returns whether the account is enabled and email is verified
    @GetMapping("/account-status")
    public ResponseEntity<AccountStatusDTO> accountStatus(@RequestParam String email) {
        User user = authenticationService.getAccountStatus(email);
        return ResponseEntity.ok(new AccountStatusDTO(user.isEmailVerified(), user.isAccountEnabled(), user.isAccountLocked()));
    }

    // POST /auth/forgot-password — generates a reset token (you would email this to the user)
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordDTO forgotPasswordDTO) {
        authenticationService.forgotPassword(forgotPasswordDTO.getEmail());
        return ResponseEntity.ok("Password reset token generated");
    }

    // POST /auth/reset-password — resets the password using the token
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDTO resetPasswordDTO) {
        authenticationService.resetPassword(resetPasswordDTO.getToken(), resetPasswordDTO.getNewPassword());
        return ResponseEntity.ok("Password reset successfully");
    }

    private ResponseCookie createJwtCookie(User user) {
        String jwtToken = jwtService.generateToken(user);

        return ResponseCookie.from("jwt", jwtToken)
                .httpOnly(true)
                .secure(false) // Enable with HTTPS.
                .path("/")
                .maxAge(jwtService.getExpirationTime() / 1000)
                .sameSite("Lax")
                .build();
    }
}
