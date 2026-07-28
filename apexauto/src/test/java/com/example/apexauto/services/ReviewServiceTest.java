package com.example.apexauto.services;

import com.example.apexauto.entity.Review;
import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.ReviewRepository;
import com.example.apexauto.repository.UserRepository;
import com.example.apexauto.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    private ReviewService reviewService;
    private User user;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(reviewRepository, userRepository, vehicleRepository);

        user = new User();
        user.setUserId(3);
        vehicle = new Vehicle();
        vehicle.setVehicleId(9);

        lenient().when(userRepository.findById(3)).thenReturn(Optional.of(user));
        lenient().when(vehicleRepository.findById(9)).thenReturn(Optional.of(vehicle));
        lenient().when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createReview_acceptsOneStarAndTrimsComments() {
        Review review = reviewService.createReview(3, 9, "  Needs improvement  ", 1);

        assertEquals("Needs improvement", review.getReviewComments());
        assertEquals(1, review.getRating());
    }

    @Test
    void createReview_acceptsFiveStars() {
        Review review = reviewService.createReview(3, 9, "Excellent vehicle", 5);

        assertEquals(5, review.getRating());
    }

    @Test
    void createReview_rejectsRatingsOutsideOneToFive() {
        assertThrows(IllegalArgumentException.class, () -> reviewService.createReview(3, 9, "Review", 0));
        assertThrows(IllegalArgumentException.class, () -> reviewService.createReview(3, 9, "Review", 6));
        assertThrows(IllegalArgumentException.class, () -> reviewService.createReview(3, 9, "Review", null));
    }

    @Test
    void updateReview_changesCommentsAndRating() {
        Review existing = new Review();
        existing.setReviewId(12);
        existing.setUser(user);
        existing.setVehicle(vehicle);
        existing.setReviewComments("Original");
        existing.setRating(2);

        when(reviewRepository.findByReviewIdAndUserUserId(12, 3)).thenReturn(Optional.of(existing));

        Review updated = reviewService.updateReviewByIdAndUserId(12, 3, "  Much better  ", 4);

        assertEquals("Much better", updated.getReviewComments());
        assertEquals(4, updated.getRating());
    }
}
