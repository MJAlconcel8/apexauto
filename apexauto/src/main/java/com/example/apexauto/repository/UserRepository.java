package com.example.apexauto.repository;

import com.example.apexauto.entity.User;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

// This is the UserRepository interface that extends CrudRepository to provide basic CRUD operations for the User entity. It also includes a method to find a user by their email address.
public interface UserRepository extends CrudRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailVerificationToken(String token);

    Optional<User> findByPasswordResetToken(String token);
}
