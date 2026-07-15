package com.example.apexauto.controller;

import com.example.apexauto.DTO.LoanCalculationResponseDTO;
import com.example.apexauto.DTO.OrderLineResponseDTO;
import com.example.apexauto.DTO.OrderResponseDTO;
import com.example.apexauto.DTO.UpdateOrderDTO;
import com.example.apexauto.DTO.UpdateOrderStatusDTO;
import com.example.apexauto.entity.OrderLine;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.services.LoanService;
import com.example.apexauto.services.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final LoanService loanService;

    public OrderController(OrderService orderService, LoanService loanService) {
        this.orderService = orderService;
        this.loanService = loanService;
    }

    // GET /orders - returns all orders, newest first.
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        try {
            List<OrderResponseDTO> orders = orderService.getAllOrders()
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /orders/status/{orderStatusId} - returns all orders with a specific status.
    @GetMapping("/status/{orderStatusId}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByStatus(@PathVariable int orderStatusId) {
        try {
            List<OrderResponseDTO> orders = orderService.getOrdersByOrderStatusId(orderStatusId)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /orders/{orderId} - returns one order.
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable int orderId) {
        try {
            Orders order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(toResponseDTO(order));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /orders/{orderId}/loan - calculates loan details for an order. Read-only, nothing is saved.
    @GetMapping("/{orderId}/loan")
    public ResponseEntity<LoanCalculationResponseDTO> calculateLoan(
            @PathVariable int orderId,
            @RequestParam BigDecimal downPayment,
            @RequestParam double annualRate,
            @RequestParam int termMonths
    ) {
        try {
            LoanCalculationResponseDTO result = loanService.calculateLoan(orderId, downPayment, annualRate, termMonths);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // PUT /orders/{orderId} - updates status or delivery date.
    @PutMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> updateOrder(
            @PathVariable int orderId,
            @RequestBody UpdateOrderDTO request
    ) {
        try {
            Orders updated = orderService.updateOrder(orderId, request);
            return ResponseEntity.ok(toResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // PATCH /orders/{orderId}/status - updates only the order status.
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable int orderId,
            @RequestBody UpdateOrderStatusDTO request
    ) {
        try {
            if (request == null) {
                throw new IllegalArgumentException("Order status update request must not be null");
            }

            Orders updated = orderService.updateOrderStatus(orderId, request.getOrderStatusId());
            return ResponseEntity.ok(toResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /orders/{orderId} - deletes an unpaid order and restores vehicle stock.
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable int orderId) {
        try {
            orderService.deleteOrder(orderId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private OrderResponseDTO toResponseDTO(Orders order) {
        List<OrderLineResponseDTO> orderLines = orderService.getOrderLines(order.getOrderId())
                .stream()
                .map(this::toOrderLineResponseDTO)
                .toList();

        return new OrderResponseDTO(
                order.getOrderId(),
                order.getUser().getUserId(),
                order.getOrderStatus().getOrderStatusId(),
                order.getOrderStatus().getOrderStatusName(),
                order.getTotalAmount(),
                order.getDeliveryDate(),
                orderLines
        );
    }

    private OrderLineResponseDTO toOrderLineResponseDTO(OrderLine orderLine) {
        Vehicle vehicle = orderLine.getVehicle();
        return new OrderLineResponseDTO(
                orderLine.getOrder().getOrderId(),
                vehicle.getVehicleId(),
                vehicle.getBrand(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getPrice(),
                orderLine.getQuantity(),
                orderLine.isFinancingSelected(),
                orderLine.getDownPayment(),
                orderLine.getAnnualRatePercent(),
                orderLine.getTermMonths(),
                orderLine.getMonthlyPayment(),
                orderLine.getLineTotalCost(),
                orderLine.getTotalInterest()
        );
    }

    private ResponseStatusException toHttpException(IllegalArgumentException ex) {
        String message = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
        HttpStatus status = message.contains("not found")
                ? HttpStatus.NOT_FOUND
                : message.contains("already exists") || message.contains("existing payment")
                ? HttpStatus.CONFLICT
                : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}
