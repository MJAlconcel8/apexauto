package com.example.apexauto.repository;

import com.example.apexauto.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Repository for Orders records.
public interface OrdersRepository extends JpaRepository<Orders, Integer> {

    Optional<Orders> findByOrderId(int orderId);

    boolean existsByOrderIdAndUserUserId(int orderId, int userId);

    List<Orders> findAllByOrderByOrderIdDesc();

    List<Orders> findByUserUserIdOrderByOrderIdDesc(int userId);

    List<Orders> findByOrderStatusOrderStatusIdOrderByOrderIdDesc(int orderStatusId);
}
