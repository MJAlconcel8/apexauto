package com.example.apexauto.repository;

import com.example.apexauto.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// This is the UserRepository interface that extends CrudRepository to provide basic CRUD operations for the User entity. It also includes a method to find a user by their email address.
public interface UserRepository extends CrudRepository<User, Integer> {

    // This method finds a user by their email address and returns an Optional containing the User if found, or an empty Optional if not found.
    Optional<User> findByEmail(String email);
}
