package com.example.apexauto.controller;

import com.example.apexauto.DTO.*;
import com.example.apexauto.entity.User;
import com.example.apexauto.exceptions.EmailNotVerifiedException;
import com.example.apexauto.services.AuthenticationService;
import com.example.apexauto.services.JWTService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final JWTService jwtService;
    private final Boolean configuredCookieSecure;
    private final String configuredCookieSameSite;

    public AuthenticationController(
            AuthenticationService authenticationService,
            JWTService jwtService,
            @Value("${app.auth.cookie-secure:auto}") String cookieSecure,
            @Value("${app.auth.cookie-same-site:auto}") String cookieSameSite
    ) {
        this.authenticationService = authenticationService;
        this.jwtService = jwtService;
        this.configuredCookieSecure = normalizeCookieSecure(cookieSecure);
        this.configuredCookieSameSite = normalizeCookieSameSite(cookieSameSite);
    }

    // POST /auth/register — creates a new user account and returns the email verification token directly
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(@RequestBody RegisterUserDTO registerUserDTO) {
        User registeredUser = authenticationService.signup(registerUserDTO);
        return ResponseEntity.ok(new RegisterResponseDTO(registeredUser, registeredUser.getEmailVerificationToken()));
    }

    // POST /auth/login — authenticates credentials, sets JWT as HttpOnly cookie, and returns user info.
    // Responds with a LoginErrorDTO code so the frontend can handle specific failures.
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginUserDTO loginUserDTO,
            HttpServletRequest request
    ) {
        try {
            User authenticatedUser = authenticationService.authenticate(loginUserDTO);
            LoginResponseDTO response = new LoginResponseDTO(
                    jwtService.getExpirationTime(),
                    authenticatedUser.getUserId()
            );

            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.SET_COOKIE,
                            createJwtCookie(authenticatedUser, request).toString()
                    )
                    .body(response);
        } catch (EmailNotVerifiedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new LoginErrorDTO(
                            "Please verify your email address before signing in.",
                            "EMAIL_NOT_VERIFIED"
                    ));
        } catch (BadCredentialsException | IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginErrorDTO(
                            "Incorrect email or password.",
                            "INVALID_CREDENTIALS"
                    ));
        } catch (IllegalStateException ex) {
            String message = ex.getMessage() == null
                    ? ""
                    : ex.getMessage().toLowerCase(Locale.ROOT);
            String code = message.contains("disabled")
                    ? "ACCOUNT_DISABLED"
                    : "ACCOUNT_LOCKED";

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new LoginErrorDTO(ex.getMessage(), code));
        }
    }

    // Returns the signed-in user.
    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUserDTO> currentUser(@AuthenticationPrincipal User authenticatedUser) {
        return ResponseEntity.ok(AuthenticatedUserDTO.from(authenticatedUser));
    }

    // PATCH /auth/me — updates the signed-in user's profile.
    @PatchMapping("/me")
    public ResponseEntity<AuthenticatedUserDTO> updateProfile(
            @AuthenticationPrincipal User authenticatedUser,
            @RequestBody UpdateProfileDTO updateProfileDTO
    ) {
        try {
            User updatedUser = authenticationService.updateProfile(
                    authenticatedUser,
                    updateProfileDTO
            );
            return ResponseEntity.ok(AuthenticatedUserDTO.from(updatedUser));
        } catch (IllegalArgumentException ex) {
            String message = ex.getMessage() == null ? "" : ex.getMessage();
            HttpStatus status = message.toLowerCase(Locale.ROOT).contains("already in use")
                    ? HttpStatus.CONFLICT
                    : HttpStatus.BAD_REQUEST;
            throw new ResponseStatusException(status, message, ex);
        }
    }

    // POST /auth/logout — clears the JWT cookie using the same attributes as login.
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        boolean secure = resolveCookieSecure(request);
        ResponseCookie clearCookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(0)
                .sameSite(resolveCookieSameSite(secure))
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

    // POST /auth/forgot-password — generates and emails a reset token
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

    private ResponseCookie createJwtCookie(User user, HttpServletRequest request) {
        String jwtToken = jwtService.generateToken(user);
        boolean secure = resolveCookieSecure(request);

        return ResponseCookie.from("jwt", jwtToken)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(jwtService.getExpirationTime() / 1000)
                .sameSite(resolveCookieSameSite(secure))
                .build();
    }

    private boolean resolveCookieSecure(HttpServletRequest request) {
        return configuredCookieSecure != null ? configuredCookieSecure : request.isSecure();
    }

    private String resolveCookieSameSite(boolean secure) {
        if (configuredCookieSameSite != null) {
            // Browsers reject SameSite=None unless Secure is also enabled.
            return !secure && configuredCookieSameSite.equals("None")
                    ? "Lax"
                    : configuredCookieSameSite;
        }

        return secure ? "None" : "Lax";
    }

    private static Boolean normalizeCookieSecure(String value) {
        String normalized = value == null ? "auto" : value.trim().toLowerCase(Locale.ROOT);

        return switch (normalized) {
            case "", "auto" -> null;
            case "true" -> true;
            case "false" -> false;
            default -> throw new IllegalArgumentException(
                    "AUTH_COOKIE_SECURE must be one of: auto, true, false"
            );
        };
    }

    private static String normalizeCookieSameSite(String value) {
        String normalized = value == null ? "auto" : value.trim().toLowerCase(Locale.ROOT);

        return switch (normalized) {
            case "", "auto" -> null;
            case "lax" -> "Lax";
            case "strict" -> "Strict";
            case "none" -> "None";
            default -> throw new IllegalArgumentException(
                    "AUTH_COOKIE_SAME_SITE must be one of: auto, Lax, Strict, None"
            );
        };
    }
}
