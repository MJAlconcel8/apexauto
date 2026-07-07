package com.example.apexauto.controller;

import com.example.apexauto.DTO.CreatePaymentStatusDTO;
import com.example.apexauto.DTO.PaymentStatusResponseDTO;
import com.example.apexauto.entity.PaymentStatus;
import com.example.apexauto.services.PaymentStatusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/payment-statuses")
public class PaymentStatusController {

    private final PaymentStatusService paymentStatusService;

    public PaymentStatusController(PaymentStatusService paymentStatusService) {
        this.paymentStatusService = paymentStatusService;
    }

    @GetMapping
    public ResponseEntity<List<PaymentStatusResponseDTO>> getAllPaymentStatuses() {
        try {
            List<PaymentStatusResponseDTO> statuses = paymentStatusService.getAllPaymentStatuses()
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(statuses);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    @GetMapping("/{paymentStatusId}")
    public ResponseEntity<PaymentStatusResponseDTO> getPaymentStatusById(@PathVariable int paymentStatusId) {
        try {
            PaymentStatus status = paymentStatusService.getPaymentStatusById(paymentStatusId);
            return ResponseEntity.ok(toResponseDTO(status));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    @PostMapping
    public ResponseEntity<PaymentStatusResponseDTO> createPaymentStatus(@RequestBody CreatePaymentStatusDTO request) {
        try {
            if (request == null) {
                throw new IllegalArgumentException("Payment status request must not be null");
            }

            PaymentStatus saved = paymentStatusService.createPaymentStatus(request.getPaymentStatusName());
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private PaymentStatusResponseDTO toResponseDTO(PaymentStatus paymentStatus) {
        return new PaymentStatusResponseDTO(
                paymentStatus.getPaymentStatusId(),
                paymentStatus.getPaymentStatusName()
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
