package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// This is the favourites entity class, which will be used to store the favourite vehicles for the users. It will have a many-to-many relationship with the Vehicle entity.
@Table(name = "favourites")
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Favourites {
    // Primary key for the favourites entry
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    @Getter
    @Setter
    private int favouriteId;

    // The foreign key relationship to the Vehicle entity, indicating which vehicle is marked as favourite by the user.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Getter
    @Setter
    private User user;

}
