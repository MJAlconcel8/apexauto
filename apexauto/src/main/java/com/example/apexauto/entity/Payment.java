package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

// This entity represents the Payment table from the ERD.
@Table(
        name = "payment",
        uniqueConstraints = @UniqueConstraint(name = "uk_payment_order", columnNames = "order_id")
)
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Payment {

    // The unique identifier for each payment.
    @Getter
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "payment_id", nullable = false)
    private int paymentId;

    // One order has one payment in the ERD, so order_id is unique in the payment table.
    @Getter
    @Setter
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Orders order;

    // A payment has one payment status, and the same status can be reused by many payments.
    @Getter
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_status_id", nullable = false)
    private PaymentStatus paymentStatus;

    // The method used to pay, for example CREDIT_CARD, DEBIT_CARD, PAYPAL, or CASH.
    @Getter
    @Setter
    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    // The date/time when the payment record was created or processed.
    @Getter
    @Setter
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "payment_date", nullable = false)
    private Date paymentDate;
}
