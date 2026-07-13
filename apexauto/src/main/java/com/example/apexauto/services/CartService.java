package com.example.apexauto.services;

import com.example.apexauto.DTO.LoanCalculationResponseDTO;
import com.example.apexauto.DTO.CreateCartDTO;
import com.example.apexauto.DTO.UpdateCartDTO;
import com.example.apexauto.entity.CartLine;
import com.example.apexauto.entity.CartLineId;
import com.example.apexauto.entity.CartStatus;
import com.example.apexauto.entity.Carts;
import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.CartLineRepository;
import com.example.apexauto.repository.CartStatusRepository;
import com.example.apexauto.repository.CartsRepository;
import com.example.apexauto.repository.UserRepository;
import com.example.apexauto.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

// This service contains cart, cart status, and cart line business logic.
@Service
public class CartService {

    private static final String DEFAULT_CART_STATUS = "ACTIVE";

    private final CartsRepository cartsRepository;
    private final CartStatusRepository cartStatusRepository;
    private final CartLineRepository cartLineRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final LoanService loanService;

    public CartService(
            CartsRepository cartsRepository,
            CartStatusRepository cartStatusRepository,
            CartLineRepository cartLineRepository,
            UserRepository userRepository,
            VehicleRepository vehicleRepository,
            LoanService loanService
    ) {
        this.cartsRepository = cartsRepository;
        this.cartStatusRepository = cartStatusRepository;
        this.cartLineRepository = cartLineRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.loanService = loanService;
    }

    @Transactional
    public Carts createCart(CreateCartDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Cart request must not be null");
        }

        User user = validateUserExists(request.getUserId());

        CartStatus cartStatus = request.getCartStatusId() == null
                ? getOrCreateDefaultCartStatus()
                : validateCartStatusExists(request.getCartStatusId());

        List<Vehicle> vehicles = validateVehiclesForNewCart(request.getVehicleIds());

        Carts cart = new Carts();
        cart.setUser(user);
        cart.setCartStatus(cartStatus);
        cart.setTotalItemsInCart(vehicles.size());

        Carts savedCart = cartsRepository.save(cart);
        createCartLines(savedCart, vehicles);

        return cartsRepository.save(savedCart);
    }

    @Transactional
    public Carts createCartForUser(int userId, CreateCartDTO request) {
        CreateCartDTO safeRequest = request == null ? new CreateCartDTO() : request;

        if (safeRequest.getUserId() != 0 && safeRequest.getUserId() != userId) {
            throw new IllegalArgumentException("Path userId does not match request body userId");
        }

        safeRequest.setUserId(userId);
        return createCart(safeRequest);
    }

    @Transactional(readOnly = true)
    public List<Carts> getAllCarts() {
        return cartsRepository.findAllByOrderByCartIdDesc();
    }

    @Transactional(readOnly = true)
    public List<Carts> getCartsByUserId(int userId) {
        validateUserExists(userId);
        return cartsRepository.findByUserUserIdOrderByCartIdDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Carts> getCartsByCartStatusId(int cartStatusId) {
        validateCartStatusExists(cartStatusId);
        return cartsRepository.findByCartStatusCartStatusIdOrderByCartIdDesc(cartStatusId);
    }

    @Transactional(readOnly = true)
    public Carts getActiveCartByUserId(int userId) {
        validateUserExists(userId);

        return cartsRepository
                .findFirstByUserUserIdAndCartStatusCartStatusNameIgnoreCaseOrderByCartIdDesc(
                        userId,
                        DEFAULT_CART_STATUS
                )
                .orElseThrow(() -> new IllegalArgumentException("Active cart not found"));
    }

    @Transactional(readOnly = true)
    public Carts getCartById(int cartId) {
        return validateCartExists(cartId);
    }

    @Transactional(readOnly = true)
    public List<CartLine> getCartLines(int cartId) {
        validateCartExists(cartId);
        return cartLineRepository.findByCartCartIdOrderByVehicleVehicleIdAsc(cartId);
    }

    @Transactional
    public Carts updateCart(int cartId, UpdateCartDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Cart update request must not be null");
        }

        Carts cart = validateCartExists(cartId);

        if (request.getCartStatusId() != null) {
            cart.setCartStatus(validateCartStatusExists(request.getCartStatusId()));
        }

        return cartsRepository.save(cart);
    }

    @Transactional
    public Carts updateCartStatus(int cartId, int cartStatusId) {
        Carts cart = validateCartExists(cartId);
        cart.setCartStatus(validateCartStatusExists(cartStatusId));
        return cartsRepository.save(cart);
    }

    @Transactional
    public Carts addVehicleToCart(
            int cartId,
            int vehicleId,
            boolean financingSelected,
            BigDecimal downPayment,
            Double annualRate,
            Integer termMonths
    ) {
        Carts cart = validateCartExists(cartId);
        Vehicle vehicle = validateVehicleForCartLine(vehicleId);

        if (cartLineRepository.existsByCartCartIdAndVehicleVehicleId(cartId, vehicleId)) {
            throw new IllegalArgumentException("Vehicle already exists in this cart");
        }

        CartLine cartLine = new CartLine();
        cartLine.setId(new CartLineId(cart.getCartId(), vehicle.getVehicleId()));
        cartLine.setCart(cart);
        cartLine.setVehicle(vehicle);
        applyPricingToCartLine(cartLine, vehicle, financingSelected, downPayment, annualRate, termMonths);
        cartLineRepository.save(cartLine);

        cart.setTotalItemsInCart(recalculateTotalItems(cart.getCartId()));

        return cartsRepository.save(cart);
    }

    @Transactional
    public Carts removeVehicleFromCart(int cartId, int vehicleId) {
        Carts cart = validateCartExists(cartId);

        CartLine cartLine = cartLineRepository.findByCartCartIdAndVehicleVehicleId(cartId, vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Cart line not found"));

        cartLineRepository.delete(cartLine);
        cart.setTotalItemsInCart(recalculateTotalItems(cart.getCartId()));

        return cartsRepository.save(cart);
    }

    @Transactional
    public void deleteCart(int cartId) {
        Carts cart = validateCartExists(cartId);

        List<CartLine> cartLines = cartLineRepository.findByCartCartIdOrderByVehicleVehicleIdAsc(cartId);
        cartLineRepository.deleteAll(cartLines);

        cartsRepository.delete(cart);
    }

    private void createCartLines(Carts cart, List<Vehicle> vehicles) {
        for (Vehicle vehicle : vehicles) {
            CartLine cartLine = new CartLine();
            cartLine.setId(new CartLineId(cart.getCartId(), vehicle.getVehicleId()));
            cartLine.setCart(cart);
            cartLine.setVehicle(vehicle);
            applyCashPricing(cartLine, vehicle);
            cartLineRepository.save(cartLine);
        }
    }

    private void applyPricingToCartLine(
            CartLine cartLine,
            Vehicle vehicle,
            boolean financingSelected,
            BigDecimal downPayment,
            Double annualRate,
            Integer termMonths
    ) {
        if (!financingSelected) {
            applyCashPricing(cartLine, vehicle);
            return;
        }

        if (annualRate == null) {
            throw new IllegalArgumentException("Annual rate is required when financing is selected");
        }

        if (termMonths == null) {
            throw new IllegalArgumentException("Term months are required when financing is selected");
        }

        LoanCalculationResponseDTO loan = loanService.calculateLoanForAmount(
                vehicle.getPrice(),
                downPayment,
                annualRate,
                termMonths
        );

        cartLine.setFinancingSelected(true);
        cartLine.setDownPayment(loan.getDownPayment());
        cartLine.setAnnualRatePercent(loan.getAnnualRatePercent());
        cartLine.setTermMonths(loan.getTermMonths());
        cartLine.setMonthlyPayment(loan.getMonthlyPayment());
        cartLine.setLineTotalCost(loan.getTotalCost());
        cartLine.setTotalInterest(loan.getTotalInterest());
    }

    private void applyCashPricing(CartLine cartLine, Vehicle vehicle) {
        cartLine.setFinancingSelected(false);
        cartLine.setDownPayment(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        cartLine.setAnnualRatePercent(null);
        cartLine.setTermMonths(null);
        cartLine.setMonthlyPayment(null);
        cartLine.setLineTotalCost(vehicle.getPrice().setScale(2, RoundingMode.HALF_UP));
        cartLine.setTotalInterest(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
    }

    private int recalculateTotalItems(int cartId) {
        return cartLineRepository.findByCartCartIdOrderByVehicleVehicleIdAsc(cartId).size();
    }

    private List<Vehicle> validateVehiclesForNewCart(List<Integer> vehicleIds) {
        List<Integer> normalizedVehicleIds = normalizeVehicleIds(vehicleIds);
        List<Vehicle> vehicles = new ArrayList<>();

        for (Integer vehicleId : normalizedVehicleIds) {
            vehicles.add(validateVehicleForCartLine(vehicleId));
        }

        return vehicles;
    }

    private List<Integer> normalizeVehicleIds(List<Integer> vehicleIds) {
        if (vehicleIds == null || vehicleIds.isEmpty()) {
            return new ArrayList<>();
        }

        Set<Integer> uniqueVehicleIds = new LinkedHashSet<>();

        for (Integer vehicleId : vehicleIds) {
            if (vehicleId == null || vehicleId <= 0) {
                throw new IllegalArgumentException("Vehicle ID must be a positive value");
            }

            if (!uniqueVehicleIds.add(vehicleId)) {
                throw new IllegalArgumentException("Duplicate vehicles are not allowed in the same cart");
            }
        }

        return new ArrayList<>(uniqueVehicleIds);
    }

    private Vehicle validateVehicleForCartLine(int vehicleId) {
        Vehicle vehicle = validateVehicleExists(vehicleId);

        if (!vehicle.isInStock() || vehicle.getAmountInStock() <= 0) {
            throw new IllegalArgumentException("Vehicle is not in stock");
        }

        if (vehicle.getPrice() == null || vehicle.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Vehicle price must not be negative");
        }

        return vehicle;
    }

    private Vehicle validateVehicleExists(int vehicleId) {
        if (vehicleId <= 0) {
            throw new IllegalArgumentException("Vehicle ID must be a positive value");
        }

        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
    }

    private Carts validateCartExists(int cartId) {
        if (cartId <= 0) {
            throw new IllegalArgumentException("Cart ID must be a positive value");
        }

        return cartsRepository.findByCartId(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
    }

    private User validateUserExists(int userId) {
        if (userId <= 0) {
            throw new IllegalArgumentException("User ID must be a positive value");
        }

        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private CartStatus validateCartStatusExists(int cartStatusId) {
        if (cartStatusId <= 0) {
            throw new IllegalArgumentException("Cart status ID must be a positive value");
        }

        return cartStatusRepository.findByCartStatusId(cartStatusId)
                .orElseThrow(() -> new IllegalArgumentException("Cart status not found"));
    }

    private CartStatus getOrCreateDefaultCartStatus() {
        return cartStatusRepository.findByCartStatusNameIgnoreCase(DEFAULT_CART_STATUS)
                .orElseGet(() -> {
                    CartStatus cartStatus = new CartStatus();
                    cartStatus.setCartStatusName(DEFAULT_CART_STATUS.toUpperCase(Locale.ROOT));
                    return cartStatusRepository.save(cartStatus);
                });
    }
}