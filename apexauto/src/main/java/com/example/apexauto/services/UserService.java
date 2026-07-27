package com.example.apexauto.services;

import com.example.apexauto.entity.Carts;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.entity.User;
import com.example.apexauto.repository.CartLineRepository;
import com.example.apexauto.repository.CartsRepository;
import com.example.apexauto.repository.FavouritesRepository;
import com.example.apexauto.repository.OrderLineRepository;
import com.example.apexauto.repository.OrdersRepository;
import com.example.apexauto.repository.PaymentRepository;
import com.example.apexauto.repository.ReviewRepository;
import com.example.apexauto.repository.SearchHistoryRepository;
import com.example.apexauto.repository.UserRepository;
import com.example.apexauto.repository.VehicleHistoryRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Set;

// This service contains admin-facing user account management logic: listing accounts,
// granting/revoking admin rights, temporarily restricting (blocking) accounts, and deletion.
@Service
public class UserService {

    private static final Set<String> ALLOWED_ROLES = Set.of("USER", "ADMIN");

    private final UserRepository userRepository;
    private final CartsRepository cartsRepository;
    private final CartLineRepository cartLineRepository;
    private final OrdersRepository ordersRepository;
    private final OrderLineRepository orderLineRepository;
    private final PaymentRepository paymentRepository;
    private final FavouritesRepository favouritesRepository;
    private final ReviewRepository reviewRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final VehicleHistoryRepository vehicleHistoryRepository;

    public UserService(
            UserRepository userRepository,
            CartsRepository cartsRepository,
            CartLineRepository cartLineRepository,
            OrdersRepository ordersRepository,
            OrderLineRepository orderLineRepository,
            PaymentRepository paymentRepository,
            FavouritesRepository favouritesRepository,
            ReviewRepository reviewRepository,
            SearchHistoryRepository searchHistoryRepository,
            VehicleHistoryRepository vehicleHistoryRepository
    ) {
        this.userRepository = userRepository;
        this.cartsRepository = cartsRepository;
        this.cartLineRepository = cartLineRepository;
        this.ordersRepository = ordersRepository;
        this.orderLineRepository = orderLineRepository;
        this.paymentRepository = paymentRepository;
        this.favouritesRepository = favouritesRepository;
        this.reviewRepository = reviewRepository;
        this.searchHistoryRepository = searchHistoryRepository;
        this.vehicleHistoryRepository = vehicleHistoryRepository;
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateUserRole(int userId, String roleName) {
        User user = validateUserExists(userId);
        String normalizedRole = normalizeRoleName(roleName);

        ensureNotActingOnSelf(userId, "You cannot change your own role");

        user.setRoleName(normalizedRole);
        return userRepository.save(user);
    }

    @Transactional
    public User restrictUser(int userId, Date restrictedUntil) {
        User user = validateUserExists(userId);

        ensureNotActingOnSelf(userId, "You cannot restrict your own account");

        if (restrictedUntil != null && restrictedUntil.before(new Date())) {
            throw new IllegalArgumentException("Restriction end date must be in the future");
        }

        user.setRestrictedUntil(restrictedUntil);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(int userId) {
        validateUserExists(userId);
        ensureNotActingOnSelf(userId, "You cannot delete your own account");

        // Remove dependent rows first so the delete doesn't fail on a foreign key constraint.
        for (Carts cart : cartsRepository.findByUserUserIdOrderByCartIdDesc(userId)) {
            cartLineRepository.deleteByCartCartId(cart.getCartId());
        }
        cartsRepository.deleteByUserUserId(userId);

        for (Orders order : ordersRepository.findByUserUserIdOrderByOrderIdDesc(userId)) {
            paymentRepository.deleteByOrderOrderId(order.getOrderId());
            orderLineRepository.deleteByOrderOrderId(order.getOrderId());
        }
        ordersRepository.deleteByUserUserId(userId);

        favouritesRepository.deleteByUserUserId(userId);
        reviewRepository.deleteByUserUserId(userId);
        searchHistoryRepository.deleteByUserUserId(userId);
        vehicleHistoryRepository.deleteByUserUserId(userId);

        userRepository.deleteById(userId);
    }

    private String normalizeRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            throw new IllegalArgumentException("Role name must not be blank");
        }

        String normalized = roleName.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_ROLES.contains(normalized)) {
            throw new IllegalArgumentException("Role name must be one of " + ALLOWED_ROLES);
        }

        return normalized;
    }

    private void ensureNotActingOnSelf(int userId, String message) {
        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser.getUserId() == userId) {
            throw new IllegalArgumentException(message);
        }
    }

    private User validateUserExists(int userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            throw new IllegalArgumentException("Invalid authentication principal");
        }

        User user = (User) principal;
        return userRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
