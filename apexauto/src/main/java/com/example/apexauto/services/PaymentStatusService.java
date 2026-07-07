package com.example.apexauto.services;

import com.example.apexauto.entity.PaymentStatus;
import com.example.apexauto.repository.PaymentStatusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

// This service manages payment status records used by payments.
@Service
public class PaymentStatusService {

    private final PaymentStatusRepository paymentStatusRepository;

    public PaymentStatusService(PaymentStatusRepository paymentStatusRepository) {
        this.paymentStatusRepository = paymentStatusRepository;
    }

    // Creates a new payment status after validating duplicate names.
    @Transactional
    public PaymentStatus createPaymentStatus(String paymentStatusName) {
        String normalizedName = normalizePaymentStatusName(paymentStatusName);

        if (paymentStatusRepository.existsByPaymentStatusNameIgnoreCase(normalizedName)) {
            throw new IllegalArgumentException("Payment status already exists");
        }

        PaymentStatus paymentStatus = new PaymentStatus();
        paymentStatus.setPaymentStatusName(normalizedName);

        return paymentStatusRepository.save(paymentStatus);
    }

    // Returns all payment statuses ordered by ID.
    @Transactional(readOnly = true)
    public List<PaymentStatus> getAllPaymentStatuses() {
        return paymentStatusRepository.findAllByOrderByPaymentStatusIdAsc();
    }

    // Returns one payment status by ID.
    @Transactional(readOnly = true)
    public PaymentStatus getPaymentStatusById(int paymentStatusId) {
        if (paymentStatusId <= 0) {
            throw new IllegalArgumentException("Payment status ID must be a positive value");
        }

        return paymentStatusRepository.findByPaymentStatusId(paymentStatusId)
                .orElseThrow(() -> new IllegalArgumentException("Payment status not found"));
    }

    private String normalizePaymentStatusName(String paymentStatusName) {
        if (paymentStatusName == null || paymentStatusName.isBlank()) {
            throw new IllegalArgumentException("Payment status name must not be blank");
        }

        return paymentStatusName.trim().toUpperCase(Locale.ROOT);
    }
}
