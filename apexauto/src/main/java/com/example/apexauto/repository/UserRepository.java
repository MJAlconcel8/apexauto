package com.example.apexauto.repository;

import com.example.apexauto.entity.User;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

// This is the UserRepository interface that extends CrudRepository to provide basic CRUD operations for the User entity. It also includes a method to find a user by their email address.
public interface UserRepository extends CrudRepository<User, Integer> {

    // This method allows you to find a user by their email address, which is useful for authentication and other user-related operations.
    Optional<User> findByEmail(String email);

   // This method allows you to check if a user with a specific email address already exists in the database, which is useful for validating user registration.
    Optional<User> findByEmailVerificationToken(String token);

    // This method allows you to check if a user with a specific email address already exists in the database, which is useful for validating user registration.
    Optional<User> findByPasswordResetToken(String token);
}
