package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// This entity represents the PaymentStatus table from the ERD.
@Table(
        name = "payment_status",
        uniqueConstraints = @UniqueConstraint(name = "uk_payment_status_name", columnNames = "payment_status_name")
)
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class PaymentStatus {

    // The unique identifier for each payment status.
    @Getter
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "payment_status_id", nullable = false)
    private int paymentStatusId;

    // The status name, such as PENDING, PAID, FAILED, or REFUNDED.
    @Getter
    @Setter
    @Column(name = "payment_status_name", nullable = false, unique = true)
    private String paymentStatusName;
}
