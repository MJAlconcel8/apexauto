package com.example.apexauto.controller;

import com.example.apexauto.DTO.*;
import com.example.apexauto.entity.User;
import com.example.apexauto.services.AuthenticationService;
import com.example.apexauto.services.JWTService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // POST /auth/login — authenticates credentials and returns a JWT
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginUserDTO loginUserDTO) {
        User authenticatedUser = authenticationService.authenticate(loginUserDTO);

        String jwtToken = jwtService.generateToken(authenticatedUser);
        LoginResponseDTO response = new LoginResponseDTO(jwtToken, jwtService.getExpirationTime());

        return ResponseEntity.ok(response);
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

}

