package com.example.apexauto.repository;

import com.example.apexauto.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Repository for reusable order statuses.
public interface OrderStatusRepository extends JpaRepository<OrderStatus, Integer> {

    Optional<OrderStatus> findByOrderStatusId(int orderStatusId);

    Optional<OrderStatus> findByOrderStatusNameIgnoreCase(String orderStatusName);

    boolean existsByOrderStatusNameIgnoreCase(String orderStatusName);

    List<OrderStatus> findAllByOrderByOrderStatusIdAsc();
}
