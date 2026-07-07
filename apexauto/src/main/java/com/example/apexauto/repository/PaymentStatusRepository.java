package com.example.apexauto.repository;

import com.example.apexauto.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Repository for PaymentStatus records.
public interface PaymentStatusRepository extends JpaRepository<PaymentStatus, Integer> {

    // Retrieves payment statuses ordered by ID for consistent display.
    List<PaymentStatus> findAllByOrderByPaymentStatusIdAsc();

    // Finds a payment status by ID.
    Optional<PaymentStatus> findByPaymentStatusId(int paymentStatusId);

    // Finds a payment status by name without caring about letter case.
    Optional<PaymentStatus> findByPaymentStatusNameIgnoreCase(String paymentStatusName);

    // Checks duplicate payment status names without caring about letter case.
    boolean existsByPaymentStatusNameIgnoreCase(String paymentStatusName);
}
