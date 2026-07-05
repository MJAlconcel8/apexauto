package com.example.apexauto.repository;

import com.example.apexauto.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Repository used by the payment service to validate and load the order connected to a payment.
public interface OrdersRepository extends JpaRepository<Orders, Integer> {

    // Finds an order by its ERD primary key.
    Optional<Orders> findByOrderId(int orderId);

    // Checks that an order belongs to a specific user.
    boolean existsByOrderIdAndUserUserId(int orderId, int userId);
}
