package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

// This entity maps the Orders table from the ERD only so payments can correctly reference an order.
// No order business endpoints are added in this payment implementation.
@Table(name = "orders")
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Orders {

    // The unique identifier for each order.
    @Getter
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "order_id", nullable = false)
    private int orderId;

    // The user who owns the order.
    @Getter
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The order status foreign key from the ERD. The OrderStatus implementation is intentionally not added here.
    @Getter
    @Setter
    @Column(name = "order_status_id", nullable = false)
    private int orderStatusId;

    // The total amount for the order.
    @Getter
    @Setter
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    // The delivery date for the order.
    @Getter
    @Setter
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "delivery_date")
    private Date deliveryDate;
}
