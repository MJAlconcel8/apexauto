package com.example.apexauto.services;

import com.example.apexauto.entity.CartStatus;
import com.example.apexauto.repository.CartStatusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

// This service manages reusable cart status records.
@Service
public class CartStatusService {

    private final CartStatusRepository cartStatusRepository;

    public CartStatusService(CartStatusRepository cartStatusRepository) {
        this.cartStatusRepository = cartStatusRepository;
    }

    @Transactional
    public CartStatus createCartStatus(String cartStatusName) {
        String normalizedName = normalizeCartStatusName(cartStatusName);

        if (cartStatusRepository.existsByCartStatusNameIgnoreCase(normalizedName)) {
            throw new IllegalArgumentException("Cart status already exists");
        }

        CartStatus cartStatus = new CartStatus();
        cartStatus.setCartStatusName(normalizedName);

        return cartStatusRepository.save(cartStatus);
    }

    @Transactional(readOnly = true)
    public List<CartStatus> getAllCartStatuses() {
        return cartStatusRepository.findAllByOrderByCartStatusIdAsc();
    }

    @Transactional(readOnly = true)
    public CartStatus getCartStatusById(int cartStatusId) {
        if (cartStatusId <= 0) {
            throw new IllegalArgumentException("Cart status ID must be a positive value");
        }

        return cartStatusRepository.findByCartStatusId(cartStatusId)
                .orElseThrow(() -> new IllegalArgumentException("Cart status not found"));
    }

    private String normalizeCartStatusName(String cartStatusName) {
        if (cartStatusName == null || cartStatusName.isBlank()) {
            throw new IllegalArgumentException("Cart status name must not be blank");
        }

        return cartStatusName.trim().toUpperCase(Locale.ROOT);
    }
}