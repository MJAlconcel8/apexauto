package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// This is the review entity class, which will be used to store reviews for the cars. It will have a one-to-many relationship with the Car entity.
@Table(name = "review")
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Review {
    // Primary key for the review entry
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    @Getter
    @Setter
    private int reviewId;

    // The foreign key relationship to the Vehicle entity, indicating which vehicle this review entry is associated with.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @Getter
    @Setter
    private Vehicle vehicle;

    // The foreign key relationship to the User entity, indicating which user made the review
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @Getter
    @Setter
    private User user;

    // The review_comments given by the user for the vehicle, which is a required field.
    @Column(nullable = false)
    @Getter
    @Setter
    private String reviewComments;
}
