package com.example.apexauto.controller;

import com.example.apexauto.DTO.*;
import com.example.apexauto.entity.User;
import com.example.apexauto.services.AuthenticationService;
import com.example.apexauto.services.JWTService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    // POST /auth/login — authenticates credentials, sets JWT as HttpOnly cookie, and returns user info
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginUserDTO loginUserDTO,
            HttpServletRequest request
    ) {
        User authenticatedUser = authenticationService.authenticate(loginUserDTO);
        LoginResponseDTO response = new LoginResponseDTO(jwtService.getExpirationTime(), authenticatedUser.getUserId());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createJwtCookie(authenticatedUser, request).toString())
                .body(response);
    }

    // Returns the signed-in user.
    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUserDTO> currentUser(@AuthenticationPrincipal User authenticatedUser) {
        return ResponseEntity.ok(AuthenticatedUserDTO.from(authenticatedUser));
    }

    // POST /auth/logout — clears the JWT cookie using the same attributes as the login cookie
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
