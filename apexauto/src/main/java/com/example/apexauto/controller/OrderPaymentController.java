package com.example.apexauto.controller;

import com.example.apexauto.DTO.CreatePaymentDTO;
import com.example.apexauto.DTO.PaymentResponseDTO;
import com.example.apexauto.entity.Payment;
import com.example.apexauto.services.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/orders/{orderId}/payment")
public class OrderPaymentController {

    private final PaymentService paymentService;

    public OrderPaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<PaymentResponseDTO> getPaymentByOrderId(@PathVariable int orderId) {
        try {
            Payment payment = paymentService.getPaymentByOrderId(orderId);
            return ResponseEntity.ok(toResponseDTO(payment));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    @PostMapping
    public ResponseEntity<PaymentResponseDTO> createPaymentForOrder(
            @PathVariable int orderId,
            @RequestBody CreatePaymentDTO request
    ) {
        try {
            Payment saved = paymentService.createPaymentForOrder(orderId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> deletePaymentByOrderId(@PathVariable int orderId) {
        try {
            paymentService.deletePaymentByOrderId(orderId);
            return ResponseEntity.noContent().build();
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
        HttpStatus status = message.contains("not found")
                ? HttpStatus.NOT_FOUND
                : message.contains("already exists")
                ? HttpStatus.CONFLICT
                : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}
