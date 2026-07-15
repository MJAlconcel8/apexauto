package com.example.apexauto.controller;

import com.example.apexauto.DTO.CreateOrderLineDTO;
import com.example.apexauto.DTO.OrderLineResponseDTO;
import com.example.apexauto.DTO.OrderResponseDTO;
import com.example.apexauto.entity.OrderLine;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.services.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/orders/{orderId}/order-lines")
public class OrderLineController {

    private final OrderService orderService;

    public OrderLineController(OrderService orderService) {
        this.orderService = orderService;
    }

    // GET /orders/{orderId}/order-lines - returns vehicles inside one order.
    @GetMapping
    public ResponseEntity<List<OrderLineResponseDTO>> getOrderLines(@PathVariable int orderId) {
        try {
            List<OrderLineResponseDTO> orderLines = orderService.getOrderLines(orderId)
                    .stream()
                    .map(this::toOrderLineResponseDTO)
                    .toList();
            return ResponseEntity.ok(orderLines);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /orders/{orderId}/order-lines - adds one vehicle to an order.
    @PostMapping
    public ResponseEntity<OrderResponseDTO> addVehicleToOrder(
            @PathVariable int orderId,
            @RequestBody CreateOrderLineDTO request
    ) {
        try {
            if (request == null) {
                throw new IllegalArgumentException("Order line request must not be null");
            }

            Orders updated = orderService.addVehicleToOrder(orderId, request.getVehicleId());
            return ResponseEntity.status(HttpStatus.CREATED).body(toOrderResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /orders/{orderId}/order-lines/{vehicleId} - removes one vehicle from an order.
    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<OrderResponseDTO> removeVehicleFromOrder(
            @PathVariable int orderId,
            @PathVariable int vehicleId
    ) {
        try {
            Orders updated = orderService.removeVehicleFromOrder(orderId, vehicleId);
            return ResponseEntity.ok(toOrderResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private OrderResponseDTO toOrderResponseDTO(Orders order) {
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
                : message.contains("already exists")
                ? HttpStatus.CONFLICT
                : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}
