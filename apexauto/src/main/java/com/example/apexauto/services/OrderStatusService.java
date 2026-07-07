package com.example.apexauto.services;

import com.example.apexauto.entity.OrderStatus;
import com.example.apexauto.repository.OrderStatusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

// This service manages reusable order status records.
@Service
public class OrderStatusService {

    private final OrderStatusRepository orderStatusRepository;

    public OrderStatusService(OrderStatusRepository orderStatusRepository) {
        this.orderStatusRepository = orderStatusRepository;
    }

    @Transactional
    public OrderStatus createOrderStatus(String orderStatusName) {
        String normalizedName = normalizeOrderStatusName(orderStatusName);

        if (orderStatusRepository.existsByOrderStatusNameIgnoreCase(normalizedName)) {
            throw new IllegalArgumentException("Order status already exists");
        }

        OrderStatus orderStatus = new OrderStatus();
        orderStatus.setOrderStatusName(normalizedName);

        return orderStatusRepository.save(orderStatus);
    }

    @Transactional(readOnly = true)
    public List<OrderStatus> getAllOrderStatuses() {
        return orderStatusRepository.findAllByOrderByOrderStatusIdAsc();
    }

    @Transactional(readOnly = true)
    public OrderStatus getOrderStatusById(int orderStatusId) {
        if (orderStatusId <= 0) {
            throw new IllegalArgumentException("Order status ID must be a positive value");
        }

        return orderStatusRepository.findByOrderStatusId(orderStatusId)
                .orElseThrow(() -> new IllegalArgumentException("Order status not found"));
    }

    private String normalizeOrderStatusName(String orderStatusName) {
        if (orderStatusName == null || orderStatusName.isBlank()) {
            throw new IllegalArgumentException("Order status name must not be blank");
        }

        return orderStatusName.trim().toUpperCase(Locale.ROOT);
    }
}
