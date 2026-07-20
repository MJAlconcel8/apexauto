package com.example.apexauto.controller;

import com.example.apexauto.DTO.CreateReviewDTO;
import com.example.apexauto.DTO.ReviewResponseDTO;
import com.example.apexauto.entity.Review;
import com.example.apexauto.entity.User;
import com.example.apexauto.services.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/users/{userId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // GET /users/{userId}/reviews — returns all reviews made by a specific user (newest first)
    @GetMapping
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByUserId(@PathVariable int userId) {
        try {
            List<ReviewResponseDTO> reviews = reviewService.getReviewsByUserId(userId)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(reviews);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /users/{userId}/reviews/{reviewId} — returns a specific review made by a user
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDTO> getReviewByIdAndUserId(
            @PathVariable int userId,
            @PathVariable int reviewId
    ) {
        try {
            Review review = reviewService.getReviewByIdAndUserId(reviewId, userId);
            return ResponseEntity.ok(toResponseDTO(review));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /users/{userId}/reviews — creates a new review for a vehicle by a user
    @PostMapping
    public ResponseEntity<ReviewResponseDTO> createReview(
            @PathVariable int userId,
            @RequestBody CreateReviewDTO request,
            @AuthenticationPrincipal User principal
    ) {
        if (!isOwnerOrAdmin(principal, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            Review saved = reviewService.createReview(userId, request.getVehicleId(), request.getReviewComments());
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // PATCH /users/{userId}/reviews/{reviewId} — updates the review comments of a specific review by a user
    @PatchMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDTO> updateReview(
            @PathVariable int userId,
            @PathVariable int reviewId,
            @RequestBody CreateReviewDTO request,
            @AuthenticationPrincipal User principal
    ) {
        if (!isOwnerOrAdmin(principal, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            Review updated = reviewService.updateReviewCommentsByIdAndUserId(reviewId, userId, request.getReviewComments());
            return ResponseEntity.ok(toResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /users/{userId}/reviews/{reviewId} — deletes a specific review made by a user (owner or admin)
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReviewByIdAndUserId(
            @PathVariable int userId,
            @PathVariable int reviewId,
            @AuthenticationPrincipal User principal
    ) {
        if (!isOwnerOrAdmin(principal, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            reviewService.deleteReviewByIdAndUserId(reviewId, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /users/{userId}/reviews — deletes all reviews made by a specific user
    @DeleteMapping
    public ResponseEntity<Void> deleteReviewsByUserId(
            @PathVariable int userId,
            @AuthenticationPrincipal User principal
    ) {
        if (!isOwnerOrAdmin(principal, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            reviewService.deleteReviewsByUserId(userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private boolean isOwnerOrAdmin(User principal, int userId) {
        if (principal == null) return false;
        if (principal.getUserId() == userId) return true;
        return principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private ReviewResponseDTO toResponseDTO(Review review) {
        return new ReviewResponseDTO(
                review.getReviewId(),
                review.getUser().getUserId(),
                review.getVehicle().getVehicleId(),
                review.getReviewComments(),
                review.getUser().getFirstName(),
                review.getUser().getLastName()
        );
    }

    private ResponseStatusException toHttpException(IllegalArgumentException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}

