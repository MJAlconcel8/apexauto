package com.example.apexauto.controller;

import com.example.apexauto.DTO.ReviewResponseDTO;
import com.example.apexauto.entity.Review;
import com.example.apexauto.services.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class GlobalReviewController {

    private final ReviewService reviewService;

    public GlobalReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // GET /reviews — returns all reviews across all vehicles and users (newest first)
    @GetMapping
    public ResponseEntity<List<ReviewResponseDTO>> getAllVehicleReviews() {
        try {
            List<ReviewResponseDTO> reviews = reviewService.getAllVehicleReviews()
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(reviews);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /reviews/vehicles/{vehicleId} — returns all reviews for a specific vehicle (newest first)
    @GetMapping("/vehicles/{vehicleId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByVehicleId(@PathVariable int vehicleId) {
        try {
            List<ReviewResponseDTO> reviews = reviewService.getReviewsByVehicleId(vehicleId)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(reviews);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /reviews — deletes all reviews across all vehicles and users
    @DeleteMapping
    public ResponseEntity<Void> deleteAllVehicleReviews() {
        try {
            reviewService.deleteAllVehicleReviews();
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /reviews/vehicles/{vehicleId} — deletes all reviews for a specific vehicle
    @DeleteMapping("/vehicles/{vehicleId}")
    public ResponseEntity<Void> deleteReviewsByVehicleId(@PathVariable int vehicleId) {
        try {
            reviewService.deleteReviewsByVehicleId(vehicleId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private ReviewResponseDTO toResponseDTO(Review review) {
        return new ReviewResponseDTO(
                review.getReviewId(),
                review.getUser().getUserId(),
                review.getVehicle().getVehicleId(),
                review.getReviewComments()
        );
    }

    private ResponseStatusException toHttpException(IllegalArgumentException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}

