package com.example.apexauto.repository;

import com.example.apexauto.entity.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Repository for reusable cart statuses.
public interface CartStatusRepository extends JpaRepository<CartStatus, Integer> {

    Optional<CartStatus> findByCartStatusId(int cartStatusId);

    Optional<CartStatus> findByCartStatusNameIgnoreCase(String cartStatusName);

    boolean existsByCartStatusNameIgnoreCase(String cartStatusName);

    List<CartStatus> findAllByOrderByCartStatusIdAsc();
}