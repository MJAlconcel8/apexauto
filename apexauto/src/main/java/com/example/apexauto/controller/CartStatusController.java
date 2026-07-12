package com.example.apexauto.controller;

import com.example.apexauto.DTO.CartStatusResponseDTO;
import com.example.apexauto.DTO.CreateCartStatusDTO;
import com.example.apexauto.entity.CartStatus;
import com.example.apexauto.services.CartStatusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/cart-statuses")
public class CartStatusController {

    private final CartStatusService cartStatusService;

    public CartStatusController(CartStatusService cartStatusService) {
        this.cartStatusService = cartStatusService;
    }

    // GET /cart-statuses - returns all cart statuses.
    @GetMapping
    public ResponseEntity<List<CartStatusResponseDTO>> getAllCartStatuses() {
        try {
            List<CartStatusResponseDTO> statuses = cartStatusService.getAllCartStatuses()
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();

            return ResponseEntity.ok(statuses);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /cart-statuses/{cartStatusId} - returns one cart status.
    @GetMapping("/{cartStatusId}")
    public ResponseEntity<CartStatusResponseDTO> getCartStatusById(@PathVariable int cartStatusId) {
        try {
            CartStatus cartStatus = cartStatusService.getCartStatusById(cartStatusId);
            return ResponseEntity.ok(toResponseDTO(cartStatus));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /cart-statuses - creates a reusable cart status.
    @PostMapping
    public ResponseEntity<CartStatusResponseDTO> createCartStatus(@RequestBody CreateCartStatusDTO request) {
        try {
            if (request == null) {
                throw new IllegalArgumentException("Cart status request must not be null");
            }

            CartStatus saved = cartStatusService.createCartStatus(request.getCartStatusName());
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private CartStatusResponseDTO toResponseDTO(CartStatus cartStatus) {
        return new CartStatusResponseDTO(
                cartStatus.getCartStatusId(),
                cartStatus.getCartStatusName()
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