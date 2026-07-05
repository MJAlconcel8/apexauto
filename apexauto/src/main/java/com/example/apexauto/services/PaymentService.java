package com.example.apexauto.services;

import com.example.apexauto.DTO.CreatePaymentDTO;
import com.example.apexauto.DTO.UpdatePaymentDTO;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.entity.Payment;
import com.example.apexauto.entity.PaymentStatus;
import com.example.apexauto.repository.OrdersRepository;
import com.example.apexauto.repository.PaymentRepository;
import com.example.apexauto.repository.PaymentStatusRepository;
import com.example.apexauto.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

// This service contains the business logic for payments and keeps the controller thin.
@Service
public class PaymentService {

    private static final String DEFAULT_PAYMENT_STATUS = "PENDING";

    private final PaymentRepository paymentRepository;
    private final PaymentStatusRepository paymentStatusRepository;
    private final OrdersRepository ordersRepository;
    private final UserRepository userRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            PaymentStatusRepository paymentStatusRepository,
            OrdersRepository ordersRepository,
            UserRepository userRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.paymentStatusRepository = paymentStatusRepository;
        this.ordersRepository = ordersRepository;
        this.userRepository = userRepository;
    }

    // Creates a payment for an existing order. The ERD says one order has one payment, so duplicates are rejected.
    @Transactional
    public Payment createPayment(CreatePaymentDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Payment request must not be null");
        }

        Orders order = validateOrderExists(request.getOrderId());

        if (paymentRepository.existsByOrderOrderId(order.getOrderId())) {
            throw new IllegalArgumentException("Payment already exists for this order");
        }

        PaymentStatus paymentStatus = request.getPaymentStatusId() == null
                ? getOrCreateDefaultPaymentStatus()
                : validatePaymentStatusExists(request.getPaymentStatusId());

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentStatus(paymentStatus);
        payment.setPaymentMethod(normalizePaymentMethod(request.getPaymentMethod()));
        payment.setPaymentDate(request.getPaymentDate() == null ? new Date() : request.getPaymentDate());

        return paymentRepository.save(payment);
    }

    // Convenience method for POST /orders/{orderId}/payment where the order ID comes from the URL.
    @Transactional
    public Payment createPaymentForOrder(int orderId, CreatePaymentDTO request) {
        CreatePaymentDTO safeRequest = request == null ? new CreatePaymentDTO() : request;

        if (safeRequest.getOrderId() != 0 && safeRequest.getOrderId() != orderId) {
            throw new IllegalArgumentException("Path orderId does not match request body orderId");
        }

        safeRequest.setOrderId(orderId);
        return createPayment(safeRequest);
    }

    // Retrieves all payments, newest first.
    @Transactional(readOnly = true)
    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByPaymentIdDesc();
    }

    // Retrieves all payments for a user's orders, newest first.
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByUserId(int userId) {
        validateUserExists(userId);
        return paymentRepository.findByOrderUserUserIdOrderByPaymentIdDesc(userId);
    }

    // Retrieves all payments with a specific payment status, newest first.
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByPaymentStatusId(int paymentStatusId) {
        validatePaymentStatusExists(paymentStatusId);
        return paymentRepository.findByPaymentStatusPaymentStatusIdOrderByPaymentIdDesc(paymentStatusId);
    }

    // Retrieves one payment by its payment ID.
    @Transactional(readOnly = true)
    public Payment getPaymentById(int paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
    }

    // Retrieves the payment linked to a specific order.
    @Transactional(readOnly = true)
    public Payment getPaymentByOrderId(int orderId) {
        validateOrderExists(orderId);
        return paymentRepository.findByOrderOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for this order"));
    }

    // Updates the editable fields of an existing payment.
    @Transactional
    public Payment updatePayment(int paymentId, UpdatePaymentDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Payment update request must not be null");
        }

        Payment payment = getPaymentById(paymentId);

        if (request.getPaymentStatusId() != null) {
            payment.setPaymentStatus(validatePaymentStatusExists(request.getPaymentStatusId()));
        }

        if (request.getPaymentMethod() != null) {
            payment.setPaymentMethod(normalizePaymentMethod(request.getPaymentMethod()));
        }

        if (request.getPaymentDate() != null) {
            payment.setPaymentDate(request.getPaymentDate());
        }

        return paymentRepository.save(payment);
    }

    // Updates only the payment status for an existing payment.
    @Transactional
    public Payment updatePaymentStatus(int paymentId, int paymentStatusId) {
        Payment payment = getPaymentById(paymentId);
        PaymentStatus paymentStatus = validatePaymentStatusExists(paymentStatusId);
        payment.setPaymentStatus(paymentStatus);
        return paymentRepository.save(payment);
    }

    // Deletes one payment by payment ID.
    @Transactional
    public void deletePayment(int paymentId) {
        Payment payment = getPaymentById(paymentId);
        paymentRepository.delete(payment);
    }

    // Deletes the payment linked to an order.
    @Transactional
    public void deletePaymentByOrderId(int orderId) {
        Payment payment = getPaymentByOrderId(orderId);
        paymentRepository.delete(payment);
    }

    private Orders validateOrderExists(int orderId) {
        if (orderId <= 0) {
            throw new IllegalArgumentException("Order ID must be a positive value");
        }

        return ordersRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }

    private void validateUserExists(int userId) {
        if (userId <= 0) {
            throw new IllegalArgumentException("User ID must be a positive value");
        }

        userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private PaymentStatus validatePaymentStatusExists(int paymentStatusId) {
        if (paymentStatusId <= 0) {
            throw new IllegalArgumentException("Payment status ID must be a positive value");
        }

        return paymentStatusRepository.findByPaymentStatusId(paymentStatusId)
                .orElseThrow(() -> new IllegalArgumentException("Payment status not found"));
    }

    private PaymentStatus getOrCreateDefaultPaymentStatus() {
        return paymentStatusRepository.findByPaymentStatusNameIgnoreCase(DEFAULT_PAYMENT_STATUS)
                .orElseGet(() -> {
                    PaymentStatus paymentStatus = new PaymentStatus();
                    paymentStatus.setPaymentStatusName(DEFAULT_PAYMENT_STATUS);
                    return paymentStatusRepository.save(paymentStatus);
                });
    }

    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new IllegalArgumentException("Payment method must not be blank");
        }

        return paymentMethod.trim();
    }
}
