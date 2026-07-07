package com.example.apexauto.repository;

import com.example.apexauto.entity.OrderLine;
import com.example.apexauto.entity.OrderLineId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Repository for vehicles attached to an order.
public interface OrderLineRepository extends JpaRepository<OrderLine, OrderLineId> {

    List<OrderLine> findByOrderOrderIdOrderByVehicleVehicleIdAsc(int orderId);

    List<OrderLine> findByVehicleVehicleIdOrderByOrderOrderIdDesc(int vehicleId);

    Optional<OrderLine> findByOrderOrderIdAndVehicleVehicleId(int orderId, int vehicleId);

    boolean existsByOrderOrderIdAndVehicleVehicleId(int orderId, int vehicleId);

    void deleteByOrderOrderId(int orderId);
}
