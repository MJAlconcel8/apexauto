package com.example.apexauto.repository;

import com.example.apexauto.entity.CartLine;
import com.example.apexauto.entity.CartLineId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Repository for vehicles attached to a cart.
public interface CartLineRepository extends JpaRepository<CartLine, CartLineId> {

    List<CartLine> findByCartCartIdOrderByVehicleVehicleIdAsc(int cartId);

    List<CartLine> findByVehicleVehicleIdOrderByCartCartIdDesc(int vehicleId);

    Optional<CartLine> findByCartCartIdAndVehicleVehicleId(int cartId, int vehicleId);

    boolean existsByCartCartIdAndVehicleVehicleId(int cartId, int vehicleId);

    void deleteByCartCartId(int cartId);
}