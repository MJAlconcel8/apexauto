package com.example.apexauto.repository;

import com.example.apexauto.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Repository for Payment records.
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    // Returns all payments newest first.
    List<Payment> findAllByOrderByPaymentIdDesc();

    // Finds the payment connected to one order.
    Optional<Payment> findByOrderOrderId(int orderId);

    // Returns all payments belonging to a user's orders.
    List<Payment> findByOrderUserUserIdOrderByPaymentIdDesc(int userId);

    // Returns all payments with the selected payment status.
    List<Payment> findByPaymentStatusPaymentStatusIdOrderByPaymentIdDesc(int paymentStatusId);

    // Checks the ERD one-order-one-payment rule.
    boolean existsByOrderOrderId(int orderId);

    // Deletes the payment connected to one order.
    void deleteByOrderOrderId(int orderId);
}
