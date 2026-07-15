package com.example.apexauto.repository;

import com.example.apexauto.entity.CartLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Repository for vehicles attached to a cart.
public interface CartLineRepository extends JpaRepository<CartLine, Integer> {

    List<CartLine> findByCartCartIdOrderByCartLineIdAsc(int cartId);

    Optional<CartLine> findByCartCartIdAndCartLineId(int cartId, int cartLineId);

    void deleteByCartCartId(int cartId);
}