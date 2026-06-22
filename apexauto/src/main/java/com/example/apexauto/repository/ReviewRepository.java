package com.example.apexauto.repository;

import com.example.apexauto.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // This method allows you to find all review entries for a specific vehicle ID, ordered by the review ID in descending order, which can be useful for displaying reviews for a vehicle in reverse chronological order.
    List<Review> findByVehicleVehicleIdOrderByReviewIdDesc(int vehicleId);

    // This method allows you to find a specific review entry by its ID and the associated user ID, which can be useful for retrieving or managing individual review records.
    Optional<Review> findByReviewIdAndUserUserId(int reviewId, int userId);

    // This method allows you to delete all review entries associated with a specific user ID, which can be useful for account deletion or data cleanup.
    void deleteByUserUserId(int userId);
}
