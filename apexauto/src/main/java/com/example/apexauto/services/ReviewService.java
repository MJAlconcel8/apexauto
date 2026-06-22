package com.example.apexauto.services;

import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.entity.Review;
import com.example.apexauto.repository.UserRepository;
import com.example.apexauto.repository.ReviewRepository;
import com.example.apexauto.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// This class is a service layer component in a Spring application that manages review related operations. It interacts with the ReviewRepository to perform CRUD operations on review data.

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            UserRepository userRepository,
            VehicleRepository vehicleRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }

    // This method creates a new review entry by a user. It first validates that the user exists, then creates a new Review object, sets the user and vehicle, and saves it to the database using the ReviewRepository.
    @Transactional
    public Review createReview(int userId, int vehicleId, String reviewComments) {
        User user = validateUserExists(userId);
        Vehicle vehicle = validateVehicleExists(vehicleId);

        Review review = new Review();
        review.setUser(user);
        review.setVehicle(vehicle);
        review.setReviewComments(reviewComments);

        return reviewRepository.save(review);
    }
    
    // This method retrieves all review entries for all vehicles in the DB, ordered by the most recent entry first. 
    @Transactional(readOnly = true)
    public List<Review> getAllVehicleReviews() {
        return reviewRepository.findAllByOrderByReviewIdDesc();
    }
    
    // This method retrieves all review entries for a specific vehicle across all users (newest first).
    @Transactional(readOnly = true)
    public List<Review> getReviewsByVehicleId(int vehicleId) {
        validateVehicleExists(vehicleId);
        return reviewRepository.findByVehicleVehicleIdOrderByReviewIdDesc(vehicleId);
    }
    
    // This method deletes all review entries for all vehicles in the DB. 
    @Transactional
    public void deleteAllVehicleReviews() {
        reviewRepository.deleteAll();
    }
    
    // This method deletes all review entries for a specific vehicle across all users.
    @Transactional
    public void deleteReviewsByVehicleId(int vehicleId) {
        validateVehicleExists(vehicleId);
        reviewRepository.deleteByVehicleVehicleId(vehicleId);
    }

    // This method retrieves all review entries made by a specific user by their user ID.
    @Transactional(readOnly = true)
    public List<Review> getReviewsByUserId(int userId) {
        validateUserExists(userId);
        return reviewRepository.findByUserUserIdOrderByReviewIdDesc(userId);
    }

    // This method retrieves a specific review entry made by a user by the review ID and user ID.
    @Transactional(readOnly = true)
    public Review getReviewByIdAndUserId(int reviewId, int userId) {
        validateUserExists(userId);
        return reviewRepository.findByReviewIdAndUserUserId(reviewId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found for the given user"));
    }

    // This method deletes a specific review entry made by a user by the review ID and user ID.
    @Transactional
    public void deleteReviewByIdAndUserId(int reviewId, int userId) {
        validateUserExists(userId);
        Review review = reviewRepository.findByReviewIdAndUserUserId(reviewId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found for the given user"));
        reviewRepository.delete(review);
    }

    // This method updates the review comments of a specific review entry made by a user by the review ID and user ID.
    @Transactional
    public Review updateReviewCommentsByIdAndUserId(int reviewId, int userId, String newComments) {
        validateUserExists(userId);
        Review review = reviewRepository.findByReviewIdAndUserUserId(reviewId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found for the given user"));
        review.setReviewComments(newComments);
        return reviewRepository.save(review);
    }

    // This method deletes all review entries made by a specific user by their user ID.
    @Transactional
    public void deleteReviewsByUserId(int userId) {
        validateUserExists(userId);
        reviewRepository.deleteByUserUserId(userId);
    }
    
    
    private User validateUserExists(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
    
    private Vehicle validateVehicleExists(int vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
    }
    
    
}
