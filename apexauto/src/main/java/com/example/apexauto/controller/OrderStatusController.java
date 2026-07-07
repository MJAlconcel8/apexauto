package com.example.apexauto.controller;

import com.example.apexauto.DTO.CreateOrderStatusDTO;
import com.example.apexauto.DTO.OrderStatusResponseDTO;
import com.example.apexauto.entity.OrderStatus;
import com.example.apexauto.services.OrderStatusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/order-statuses")
public class OrderStatusController {

    private final OrderStatusService orderStatusService;

    public OrderStatusController(OrderStatusService orderStatusService) {
        this.orderStatusService = orderStatusService;
    }

    // GET /order-statuses - returns all order statuses.
    @GetMapping
    public ResponseEntity<List<OrderStatusResponseDTO>> getAllOrderStatuses() {
        try {
            List<OrderStatusResponseDTO> statuses = orderStatusService.getAllOrderStatuses()
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(statuses);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /order-statuses/{orderStatusId} - returns one order status.
    @GetMapping("/{orderStatusId}")
    public ResponseEntity<OrderStatusResponseDTO> getOrderStatusById(@PathVariable int orderStatusId) {
        try {
            OrderStatus orderStatus = orderStatusService.getOrderStatusById(orderStatusId);
            return ResponseEntity.ok(toResponseDTO(orderStatus));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /order-statuses - creates a reusable order status.
    @PostMapping
    public ResponseEntity<OrderStatusResponseDTO> createOrderStatus(@RequestBody CreateOrderStatusDTO request) {
        try {
            if (request == null) {
                throw new IllegalArgumentException("Order status request must not be null");
            }

            OrderStatus saved = orderStatusService.createOrderStatus(request.getOrderStatusName());
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private OrderStatusResponseDTO toResponseDTO(OrderStatus orderStatus) {
        return new OrderStatusResponseDTO(
                orderStatus.getOrderStatusId(),
                orderStatus.getOrderStatusName()
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
