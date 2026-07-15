package com.example.apexauto.controller;

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
@RequestMapping("/users/{userId}/orders")
public class UserOrderController {

    private final OrderService orderService;

    public UserOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // GET /users/{userId}/orders - returns all orders for one user.
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByUserId(@PathVariable int userId) {
        try {
            List<OrderResponseDTO> orders = orderService.getOrdersByUserId(userId)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(orders);
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
        HttpStatus status = message.contains("not found") ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}
