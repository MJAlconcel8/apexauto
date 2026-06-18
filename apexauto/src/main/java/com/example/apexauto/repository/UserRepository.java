package com.example.apexauto.repository;

import com.example.apexauto.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// This is the UserRepository interface that extends CrudRepository to provide basic CRUD operations for the User entity. It also includes a method to find a user by their email address.
public interface UserRepository extends JpaRepository<User, Integer> {

    // This method findByUserId is used to retrieve a User entity from the database based on the provided user ID. It returns an Optional<User>, which can be empty if no user with the given ID exists.
    Optional<User> findByUserId(int userId);

    // This method allows you to find a user by their email address, which is useful for authentication and other user-related operations.
    Optional<User> findByEmail(String email);

   // This method allows you to check if a user with a specific email address already exists in the database, which is useful for validating user registration.
    Optional<User> findByEmailVerificationToken(String token);

    // This method allows you to check if a user with a specific email address already exists in the database, which is useful for validating user registration.
    Optional<User> findByPasswordResetToken(String token);
}
