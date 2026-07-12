package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// This entity represents the CartStatus table from the ERD.
@Table(
        name = "cart_status",
        uniqueConstraints = @UniqueConstraint(name = "uk_cart_status_name", columnNames = "cart_status_name")
)
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class CartStatus {

    // The unique identifier for each cart status.
    @Getter
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "cart_status_id", nullable = false)
    private int cartStatusId;

    // The status name, such as ACTIVE, CHECKED_OUT, or ABANDONED.
    @Getter
    @Setter
    @Column(name = "cart_status_name", nullable = false, unique = true)
    private String cartStatusName;
}