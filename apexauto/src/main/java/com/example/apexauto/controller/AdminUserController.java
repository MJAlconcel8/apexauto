package com.example.apexauto.controller;

import com.example.apexauto.DTO.RestrictUserDTO;
import com.example.apexauto.DTO.UpdateUserRoleDTO;
import com.example.apexauto.DTO.UserResponseDTO;
import com.example.apexauto.entity.User;
import com.example.apexauto.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

// Admin-only endpoints for managing registered user accounts: viewing accounts, granting/revoking
// admin rights, temporarily restricting (blocking) accounts, and deleting accounts.
@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    // GET /admin/users - returns all registered accounts.
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers()
                .stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(users);
    }

    // PATCH /admin/users/{userId}/role - grants or revokes admin rights.
    @PatchMapping("/{userId}/role")
    public ResponseEntity<UserResponseDTO> updateUserRole(
            @PathVariable int userId,
            @RequestBody UpdateUserRoleDTO request
    ) {
        try {
            if (request == null) {
                throw new IllegalArgumentException("Role update request must not be null");
            }

            User updated = userService.updateUserRole(userId, request.getRoleName());
            return ResponseEntity.ok(toResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // PATCH /admin/users/{userId}/restrict - restricts (blocks) the account until the given date,
    // or lifts an existing restriction when restrictedUntil is null.
    @PatchMapping("/{userId}/restrict")
    public ResponseEntity<UserResponseDTO> restrictUser(
            @PathVariable int userId,
            @RequestBody RestrictUserDTO request
    ) {
        try {
            User updated = userService.restrictUser(userId, request == null ? null : request.getRestrictedUntil());
            return ResponseEntity.ok(toResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /admin/users/{userId} - permanently deletes the account.
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable int userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private UserResponseDTO toResponseDTO(User user) {
        return new UserResponseDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRoleName(),
                user.isEmailVerified(),
                user.isAccountEnabled(),
                user.isAccountLocked(),
                user.getRestrictedUntil(),
                user.getCreatedAt()
        );
    }

    private ResponseStatusException toHttpException(IllegalArgumentException ex) {
        String message = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
        HttpStatus status = message.contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}
