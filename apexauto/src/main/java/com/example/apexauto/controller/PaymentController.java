package com.example.apexauto.controller;

import com.example.apexauto.DTO.CreatePaymentDTO;
import com.example.apexauto.DTO.PaymentResponseDTO;
import com.example.apexauto.DTO.UpdatePaymentDTO;
import com.example.apexauto.DTO.UpdatePaymentStatusDTO;
import com.example.apexauto.entity.Payment;
import com.example.apexauto.services.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // GET /payments â€” returns all payments, newest first.
    @GetMapping
    public ResponseEntity<List<PaymentResponseDTO>> getAllPayments() {
        try {
            List<PaymentResponseDTO> payments = paymentService.getAllPayments()
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(payments);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /payments/status/{paymentStatusId} â€” returns all payments with a specific payment status.
    @GetMapping("/status/{paymentStatusId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByStatus(@PathVariable int paymentStatusId) {
        try {
            List<PaymentResponseDTO> payments = paymentService.getPaymentsByPaymentStatusId(paymentStatusId)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(payments);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /payments/{paymentId} â€” returns a specific payment.
    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable int paymentId) {
        try {
            Payment payment = paymentService.getPaymentById(paymentId);
            return ResponseEntity.ok(toResponseDTO(payment));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /payments â€” creates a payment using orderId from the request body.
    @PostMapping
    public ResponseEntity<PaymentResponseDTO> createPayment(@RequestBody CreatePaymentDTO request) {
        try {
            Payment saved = paymentService.createPayment(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // PUT /payments/{paymentId} â€” updates the editable fields for a payment.
    @PutMapping("/{paymentId}")
    public ResponseEntity<PaymentResponseDTO> updatePayment(
            @PathVariable int paymentId,
            @RequestBody UpdatePaymentDTO request
    ) {
        try {
            Payment updated = paymentService.updatePayment(paymentId, request);
            return ResponseEntity.ok(toResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // PATCH /payments/{paymentId}/status â€” updates only the payment status.
    @PatchMapping("/{paymentId}/status")
    public ResponseEntity<PaymentResponseDTO> updatePaymentStatus(
            @PathVariable int paymentId,
            @RequestBody UpdatePaymentStatusDTO request
    ) {
        try {
            if (request == null) {
                throw new IllegalArgumentException("Payment status update request must not be null");
            }

            Payment updated = paymentService.updatePaymentStatus(paymentId, request.getPaymentStatusId());
            return ResponseEntity.ok(toResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /payments/{paymentId} â€” deletes a payment.
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(@PathVariable int paymentId) {
        try {
            paymentService.deletePayment(paymentId);
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
