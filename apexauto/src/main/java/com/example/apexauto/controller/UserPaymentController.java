package com.example.apexauto.controller;

import com.example.apexauto.DTO.PaymentResponseDTO;
import com.example.apexauto.entity.Payment;
import com.example.apexauto.services.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/users/{userId}/payments")
public class UserPaymentController {

    private final PaymentService paymentService;

    public UserPaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // GET /users/{userId}/payments — returns all payments for orders owned by a user.
    @GetMapping
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByUserId(@PathVariable int userId) {
        try {
            List<PaymentResponseDTO> payments = paymentService.getPaymentsByUserId(userId)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(payments);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private PaymentResponseDTO toResponseDTO(Payment payment) {
        return new PaymentResponseDTO(
                payment.getPaymentId(),
                payment.getOrder().getOrderId(),
                payment.getOrder().getUser().getUserId(),
                payment.getPaymentStatus().getPaymentStatusId(),
                payment.getPaymentStatus().getPaymentStatusName(),
                payment.getPaymentMethod(),
                payment.getPaymentDate()
        );
    }

    private ResponseStatusException toHttpException(IllegalArgumentException ex) {
        String message = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
        HttpStatus status = message.contains("not found") ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}
