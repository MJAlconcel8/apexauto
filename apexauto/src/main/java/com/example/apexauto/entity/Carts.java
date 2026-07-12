package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// This entity represents a user's shopping cart.
// A cart belongs to one user and has one status, such as ACTIVE, CHECKED_OUT, or ABANDONED.
@Table(name = "carts")
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Carts {

    // The unique identifier for each cart.
    @Getter
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "cart_id", nullable = false)
    private int cartId;

    // The user who owns this cart.
    @Getter
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The current status of the cart.
    @Getter
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_status_id", nullable = false)
    private CartStatus cartStatus;

    // The total number of vehicle items currently in the cart.
    @Getter
    @Setter
    @Column(name = "total_items_in_cart", nullable = false)
    private int totalItemsInCart;
}