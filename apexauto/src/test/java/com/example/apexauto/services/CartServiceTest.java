package com.example.apexauto.services;

import com.example.apexauto.DTO.LoanCalculationResponseDTO;
import com.example.apexauto.entity.CartLine;
import com.example.apexauto.entity.CartStatus;
import com.example.apexauto.entity.Carts;
import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.CartLineRepository;
import com.example.apexauto.repository.CartStatusRepository;
import com.example.apexauto.repository.CartsRepository;
import com.example.apexauto.repository.UserRepository;
import com.example.apexauto.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartsRepository cartsRepository;

    @Mock
    private CartStatusRepository cartStatusRepository;

    @Mock
    private CartLineRepository cartLineRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private LoanService loanService;

    private CartService cartService;

    @BeforeEach
    void setUp() {
        cartService = new CartService(
                cartsRepository,
                cartStatusRepository,
                cartLineRepository,
                userRepository,
                vehicleRepository,
                loanService
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void addVehicleToCart_persistsFinancingSnapshotOnCartLine() {
        User user = new User();
        user.setUserId(8);
        mockAuthenticatedUser(user);

        CartStatus status = new CartStatus();
        status.setCartStatusId(1);
        status.setCartStatusName("ACTIVE");

        Carts cart = new Carts();
        cart.setCartId(55);
        cart.setUser(user);
        cart.setCartStatus(status);

        Vehicle vehicle = vehicle(10, "20000.00", 3);

        LoanCalculationResponseDTO loan = new LoanCalculationResponseDTO(
                0,
                new BigDecimal("20000.00"),
                new BigDecimal("2500.00"),
                new BigDecimal("17500.00"),
                5.9,
                60,
                new BigDecimal("337.60"),
                new BigDecimal("22756.00"),
                new BigDecimal("5256.00")
        );

        when(cartsRepository.findByCartId(55)).thenReturn(Optional.of(cart));
        when(userRepository.findByUserId(8)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(10)).thenReturn(Optional.of(vehicle));
        CartLine persistedLine = new CartLine();
        persistedLine.setQuantity(1);
        AtomicInteger queryCount = new AtomicInteger();
        when(cartLineRepository.findByCartCartIdOrderByCartLineIdAsc(55))
                .thenAnswer(invocation -> queryCount.getAndIncrement() == 0
                        ? Collections.emptyList()
                        : Collections.singletonList(persistedLine));
        when(loanService.calculateLoanForAmount(vehicle.getPrice(), new BigDecimal("2500.00"), 5.9, 60))
                .thenReturn(loan);
        when(cartsRepository.save(any(Carts.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Carts updated = cartService.addVehicleToCart(55, 10, null, true, new BigDecimal("2500.00"), 5.9, 60);

        assertEquals(1, updated.getTotalItemsInCart());

        ArgumentCaptor<CartLine> cartLineCaptor = ArgumentCaptor.forClass(CartLine.class);
        verify(cartLineRepository).save(cartLineCaptor.capture());
        CartLine savedLine = cartLineCaptor.getValue();

        assertTrue(savedLine.isFinancingSelected());
        assertEquals(1, savedLine.getQuantity());
        assertEquals(new BigDecimal("2500.00"), savedLine.getDownPayment());
        assertEquals(5.9, savedLine.getAnnualRatePercent());
        assertEquals(60, savedLine.getTermMonths());
        assertEquals(new BigDecimal("337.60"), savedLine.getMonthlyPayment());
        assertEquals(new BigDecimal("22756.00"), savedLine.getLineTotalCost());
        assertEquals(new BigDecimal("5256.00"), savedLine.getTotalInterest());
    }

    @Test
    void addVehicleToCart_withoutFinancingStoresCashPricing() {
        User user = new User();
        user.setUserId(8);
        mockAuthenticatedUser(user);

        CartStatus status = new CartStatus();
        status.setCartStatusId(1);
        status.setCartStatusName("ACTIVE");

        Carts cart = new Carts();
        cart.setCartId(55);
        cart.setUser(user);
        cart.setCartStatus(status);

        Vehicle vehicle = vehicle(12, "12500.00", 1);

        when(cartsRepository.findByCartId(55)).thenReturn(Optional.of(cart));
        when(userRepository.findByUserId(8)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(12)).thenReturn(Optional.of(vehicle));
        CartLine persistedLine = new CartLine();
        persistedLine.setQuantity(1);
        AtomicInteger queryCount = new AtomicInteger();
        when(cartLineRepository.findByCartCartIdOrderByCartLineIdAsc(55))
                .thenAnswer(invocation -> queryCount.getAndIncrement() == 0
                        ? Collections.emptyList()
                        : Collections.singletonList(persistedLine));
        when(cartsRepository.save(any(Carts.class))).thenAnswer(invocation -> invocation.getArgument(0));

        cartService.addVehicleToCart(55, 12, null, false, null, null, null);

        ArgumentCaptor<CartLine> cartLineCaptor = ArgumentCaptor.forClass(CartLine.class);
        verify(cartLineRepository).save(cartLineCaptor.capture());
        CartLine savedLine = cartLineCaptor.getValue();

        assertFalse(savedLine.isFinancingSelected());
        assertEquals(1, savedLine.getQuantity());
        assertEquals(new BigDecimal("0.00"), savedLine.getDownPayment());
        assertEquals(new BigDecimal("12500.00"), savedLine.getLineTotalCost());
        assertEquals(new BigDecimal("0.00"), savedLine.getTotalInterest());
    }

    @Test
    void addVehicleToCart_duplicateVehicleCreatesSeparateCartLinesForDifferentFinancing() {
        User user = new User();
        user.setUserId(8);
        mockAuthenticatedUser(user);

        CartStatus status = new CartStatus();
        status.setCartStatusId(1);
        status.setCartStatusName("ACTIVE");

        Carts cart = new Carts();
        cart.setCartId(55);
        cart.setUser(user);
        cart.setCartStatus(status);

        Vehicle vehicle = vehicle(12, "12500.00", 5);

        LoanCalculationResponseDTO loan = new LoanCalculationResponseDTO(
                0,
                new BigDecimal("12500.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("11500.00"),
                8.1,
                36,
                new BigDecimal("362.98"),
                new BigDecimal("13067.28"),
                new BigDecimal("1567.28")
        );

        CartLine cashLine = new CartLine();
        cashLine.setVehicle(vehicle);
        cashLine.setQuantity(1);

        CartLine financedLine = new CartLine();
        financedLine.setVehicle(vehicle);
        financedLine.setQuantity(1);

        when(cartsRepository.findByCartId(55)).thenReturn(Optional.of(cart));
        when(userRepository.findByUserId(8)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(12)).thenReturn(Optional.of(vehicle));
        AtomicInteger queryCount = new AtomicInteger();
        when(cartLineRepository.findByCartCartIdOrderByCartLineIdAsc(55))
                .thenAnswer(invocation -> {
                    int call = queryCount.getAndIncrement();
                    if (call == 0) {
                        return Collections.emptyList();
                    }
                    if (call == 1 || call == 2) {
                        return Collections.singletonList(cashLine);
                    }
                    return Arrays.asList(cashLine, financedLine);
                });
        when(loanService.calculateLoanForAmount(vehicle.getPrice(), new BigDecimal("1000.00"), 8.1, 36))
                .thenReturn(loan);
        when(cartsRepository.save(any(Carts.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Carts firstUpdated = cartService.addVehicleToCart(55, 12, null, false, null, null, null);
        assertEquals(1, firstUpdated.getTotalItemsInCart());

        Carts updated = cartService.addVehicleToCart(55, 12, null, true, new BigDecimal("1000.00"), 8.1, 36);
        assertEquals(2, updated.getTotalItemsInCart());

        ArgumentCaptor<CartLine> cartLineCaptor = ArgumentCaptor.forClass(CartLine.class);
        verify(cartLineRepository, org.mockito.Mockito.times(2)).save(cartLineCaptor.capture());

        List<CartLine> savedLines = cartLineCaptor.getAllValues();
        assertFalse(savedLines.get(0).isFinancingSelected());
        assertEquals(new BigDecimal("12500.00"), savedLines.get(0).getLineTotalCost());

        assertTrue(savedLines.get(1).isFinancingSelected());
        assertEquals(new BigDecimal("1000.00"), savedLines.get(1).getDownPayment());
        assertEquals(8.1, savedLines.get(1).getAnnualRatePercent());
        assertEquals(36, savedLines.get(1).getTermMonths());
        assertEquals(new BigDecimal("362.98"), savedLines.get(1).getMonthlyPayment());
        assertEquals(new BigDecimal("13067.28"), savedLines.get(1).getLineTotalCost());
        assertEquals(new BigDecimal("1567.28"), savedLines.get(1).getTotalInterest());
    }

    private void mockAuthenticatedUser(User user) {
        Authentication authentication = org.mockito.Mockito.mock(Authentication.class);
        SecurityContext securityContext = org.mockito.Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(authentication.isAuthenticated()).thenReturn(true);
        SecurityContextHolder.setContext(securityContext);
    }

    private Vehicle vehicle(int vehicleId, String price, int amountInStock) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(vehicleId);
        vehicle.setPrice(new BigDecimal(price));
        vehicle.setAmountInStock(amountInStock);
        vehicle.setInStock(amountInStock > 0);
        return vehicle;
    }
}


