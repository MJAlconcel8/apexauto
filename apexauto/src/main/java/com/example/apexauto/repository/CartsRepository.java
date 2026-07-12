package com.example.apexauto.repository;

import com.example.apexauto.entity.Carts;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Repository for Carts records.
public interface CartsRepository extends JpaRepository<Carts, Integer> {

    Optional<Carts> findByCartId(int cartId);

    boolean existsByCartIdAndUserUserId(int cartId, int userId);

    List<Carts> findAllByOrderByCartIdDesc();

    List<Carts> findByUserUserIdOrderByCartIdDesc(int userId);

    List<Carts> findByCartStatusCartStatusIdOrderByCartIdDesc(int cartStatusId);

    Optional<Carts> findFirstByUserUserIdAndCartStatusCartStatusNameIgnoreCaseOrderByCartIdDesc(
            int userId,
            String cartStatusName
    );
}