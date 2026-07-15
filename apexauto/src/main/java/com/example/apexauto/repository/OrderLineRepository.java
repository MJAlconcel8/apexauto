package com.example.apexauto.repository;

import com.example.apexauto.entity.OrderLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Repository for vehicles attached to an order.
public interface OrderLineRepository extends JpaRepository<OrderLine, Integer> {

    List<OrderLine> findByOrderOrderIdOrderByOrderLineIdAsc(int orderId);

    Optional<OrderLine> findByOrderOrderIdAndOrderLineId(int orderId, int orderLineId);

    void deleteByOrderOrderId(int orderId);
}
