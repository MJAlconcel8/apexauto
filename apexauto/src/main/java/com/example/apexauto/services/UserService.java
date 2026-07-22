package com.example.apexauto.services;

import com.example.apexauto.entity.User;
import com.example.apexauto.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Set;

// This service contains admin-facing user account management logic: listing accounts,
// granting/revoking admin rights, temporarily restricting (blocking) accounts, and deletion.
@Service
public class UserService {

    private static final Set<String> ALLOWED_ROLES = Set.of("USER", "ADMIN");

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateUserRole(int userId, String roleName) {
        User user = validateUserExists(userId);
        String normalizedRole = normalizeRoleName(roleName);

        ensureNotActingOnSelf(userId, "You cannot change your own role");

        user.setRoleName(normalizedRole);
        return userRepository.save(user);
    }

    @Transactional
    public User restrictUser(int userId, Date restrictedUntil) {
        User user = validateUserExists(userId);

        ensureNotActingOnSelf(userId, "You cannot restrict your own account");

        if (restrictedUntil != null && restrictedUntil.before(new Date())) {
            throw new IllegalArgumentException("Restriction end date must be in the future");
        }

        user.setRestrictedUntil(restrictedUntil);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(int userId) {
        validateUserExists(userId);
        ensureNotActingOnSelf(userId, "You cannot delete your own account");
        userRepository.deleteById(userId);
    }

    private String normalizeRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            throw new IllegalArgumentException("Role name must not be blank");
        }

        String normalized = roleName.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_ROLES.contains(normalized)) {
            throw new IllegalArgumentException("Role name must be one of " + ALLOWED_ROLES);
        }

        return normalized;
    }

    private void ensureNotActingOnSelf(int userId, String message) {
        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser.getUserId() == userId) {
            throw new IllegalArgumentException(message);
        }
    }

    private User validateUserExists(int userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            throw new IllegalArgumentException("Invalid authentication principal");
        }

        User user = (User) principal;
        return userRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
