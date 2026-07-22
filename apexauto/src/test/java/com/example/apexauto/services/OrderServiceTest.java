package com.example.apexauto.services;

import com.example.apexauto.entity.CartLine;
import com.example.apexauto.entity.CartStatus;
import com.example.apexauto.entity.Carts;
import com.example.apexauto.entity.OrderLine;
import com.example.apexauto.entity.OrderStatus;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.CartLineRepository;
import com.example.apexauto.repository.CartsRepository;
import com.example.apexauto.repository.CartStatusRepository;
import com.example.apexauto.repository.OrderLineRepository;
import com.example.apexauto.repository.OrderStatusRepository;
import com.example.apexauto.repository.OrdersRepository;
import com.example.apexauto.repository.PaymentRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrdersRepository ordersRepository;

    @Mock
    private OrderStatusRepository orderStatusRepository;

    @Mock
    private OrderLineRepository orderLineRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private CartLineRepository cartLineRepository;

    @Mock
    private CartsRepository cartsRepository;

    @Mock
    private CartStatusRepository cartStatusRepository;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                ordersRepository,
                orderStatusRepository,
                orderLineRepository,
                userRepository,
                vehicleRepository,
                paymentRepository,
                cartLineRepository,
                cartsRepository,
                cartStatusRepository
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }


    @Test
    void addVehicleToOrder_rejectsWhenPaymentExists() {
        Orders order = new Orders();
        order.setOrderId(100);

        when(ordersRepository.findByOrderId(100)).thenReturn(Optional.of(order));
        when(paymentRepository.existsByOrderOrderId(100)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> orderService.addVehicleToOrder(100, 10)
        );

        assertEquals("Cannot change order lines after payment exists", exception.getMessage());
        verify(vehicleRepository, never()).findById(10);
        verify(orderLineRepository, never()).save(any(OrderLine.class));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    void createOrderFromCart_rejectsWhenUserDoesNotOwnCart() {
        User loggedInUser = new User();
        loggedInUser.setUserId(100);
        loggedInUser.setEmail("user100@example.com");

        User cartOwner = new User();
        cartOwner.setUserId(200);
        cartOwner.setEmail("user200@example.com");

        Carts cart = new Carts();
        cart.setCartId(15);
        cart.setUser(cartOwner);

        // Mock the security context
        Authentication authentication = org.mockito.Mockito.mock(Authentication.class);
        SecurityContext securityContext = org.mockito.Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(loggedInUser);
        when(authentication.isAuthenticated()).thenReturn(true);
        SecurityContextHolder.setContext(securityContext);

        when(cartsRepository.findByCartId(15)).thenReturn(Optional.of(cart));
        when(userRepository.findByUserId(100)).thenReturn(Optional.of(loggedInUser));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> orderService.createOrderFromCart(15)
        );

        assertEquals("You do not have permission to check out this cart", exception.getMessage());
        verify(cartLineRepository, never()).findByCartCartIdOrderByCartLineIdAsc(15);
    }

    @Test
    void createOrderFromCart_usesFinancedLineTotalsAndCopiesFinancingSnapshot() {
        User user = new User();
        user.setUserId(77);
        user.setEmail("test@example.com");

        CartStatus activeStatus = new CartStatus();
        activeStatus.setCartStatusId(1);
        activeStatus.setCartStatusName("ACTIVE");

        CartStatus checkedOutStatus = new CartStatus();
        checkedOutStatus.setCartStatusId(2);
        checkedOutStatus.setCartStatusName("CHECKED_OUT");

        Carts cart = new Carts();
        cart.setCartId(15);
        cart.setUser(user);
        cart.setCartStatus(activeStatus);

        Vehicle financedVehicle = vehicle(10, "20000.00", 3);
        Vehicle cashVehicle = vehicle(11, "5000.00", 2);

        CartLine financedCartLine = new CartLine();
        financedCartLine.setCart(cart);
        financedCartLine.setVehicle(financedVehicle);
        financedCartLine.setQuantity(2);
        financedCartLine.setFinancingSelected(true);
        financedCartLine.setDownPayment(new BigDecimal("3000.00"));
        financedCartLine.setAnnualRatePercent(6.5);
        financedCartLine.setTermMonths(48);
        financedCartLine.setMonthlyPayment(new BigDecimal("398.88"));
        financedCartLine.setLineTotalCost(new BigDecimal("22146.24"));
        financedCartLine.setTotalInterest(new BigDecimal("5146.24"));

        CartLine cashCartLine = new CartLine();
        cashCartLine.setCart(cart);
        cashCartLine.setVehicle(cashVehicle);
        cashCartLine.setQuantity(1);
        cashCartLine.setFinancingSelected(false);
        cashCartLine.setDownPayment(new BigDecimal("0.00"));
        cashCartLine.setLineTotalCost(new BigDecimal("5000.00"));
        cashCartLine.setTotalInterest(new BigDecimal("0.00"));

        OrderStatus pending = new OrderStatus();
        pending.setOrderStatusId(1);
        pending.setOrderStatusName("PENDING");

        // Mock the security context
        Authentication authentication = org.mockito.Mockito.mock(Authentication.class);
        SecurityContext securityContext = org.mockito.Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(authentication.isAuthenticated()).thenReturn(true);
        SecurityContextHolder.setContext(securityContext);

        when(cartsRepository.findByCartId(15)).thenReturn(Optional.of(cart));
        when(userRepository.findByUserId(77)).thenReturn(Optional.of(user));
        when(cartLineRepository.findByCartCartIdOrderByCartLineIdAsc(15))
                .thenReturn(List.of(financedCartLine, cashCartLine));
        when(orderStatusRepository.findByOrderStatusNameIgnoreCase("PENDING")).thenReturn(Optional.of(pending));
        when(cartStatusRepository.findByCartStatusNameIgnoreCase("CHECKED_OUT")).thenReturn(Optional.of(checkedOutStatus));
        when(ordersRepository.save(any(Orders.class))).thenAnswer(invocation -> {
            Orders savedOrder = invocation.getArgument(0);
            if (savedOrder.getOrderId() == 0) {
                savedOrder.setOrderId(900);
            }
            return savedOrder;
        });

        Orders created = orderService.createOrderFromCart(15);

        assertEquals(new BigDecimal("56950.50"), created.getTotalAmount());
        assertEquals(1, financedVehicle.getAmountInStock());
        assertEquals(1, cashVehicle.getAmountInStock());

        ArgumentCaptor<OrderLine> orderLineCaptor = ArgumentCaptor.forClass(OrderLine.class);
        verify(orderLineRepository, times(2)).save(orderLineCaptor.capture());

        List<OrderLine> savedLines = orderLineCaptor.getAllValues();
        OrderLine savedFinancedLine = savedLines.get(0);
        OrderLine savedCashLine = savedLines.get(1);

        assertTrue(savedFinancedLine.isFinancingSelected());
        assertEquals(2, savedFinancedLine.getQuantity());
        assertEquals(new BigDecimal("3000.00"), savedFinancedLine.getDownPayment());
        assertEquals(6.5, savedFinancedLine.getAnnualRatePercent());
        assertEquals(48, savedFinancedLine.getTermMonths());
        assertEquals(new BigDecimal("398.88"), savedFinancedLine.getMonthlyPayment());
        assertEquals(new BigDecimal("22146.24"), savedFinancedLine.getLineTotalCost());
        assertEquals(new BigDecimal("5146.24"), savedFinancedLine.getTotalInterest());

        assertFalse(savedCashLine.isFinancingSelected());
        assertEquals(1, savedCashLine.getQuantity());
        assertEquals(new BigDecimal("5000.00"), savedCashLine.getLineTotalCost());
        assertEquals(new BigDecimal("0.00"), savedCashLine.getTotalInterest());
    }

    @Test
    void createOrderFromCart_preservesDuplicateVehicleLinesWithDifferentFinancing() {
        User user = new User();
        user.setUserId(77);
        user.setEmail("test@example.com");

        CartStatus activeStatus = new CartStatus();
        activeStatus.setCartStatusId(1);
        activeStatus.setCartStatusName("ACTIVE");

        CartStatus checkedOutStatus = new CartStatus();
        checkedOutStatus.setCartStatusId(2);
        checkedOutStatus.setCartStatusName("CHECKED_OUT");

        Carts cart = new Carts();
        cart.setCartId(15);
        cart.setUser(user);
        cart.setCartStatus(activeStatus);

        Vehicle vehicle = vehicle(10, "20000.00", 3);

        CartLine cashCartLine = new CartLine();
        cashCartLine.setCart(cart);
        cashCartLine.setVehicle(vehicle);
        cashCartLine.setQuantity(1);
        cashCartLine.setFinancingSelected(false);
        cashCartLine.setDownPayment(new BigDecimal("0.00"));
        cashCartLine.setLineTotalCost(new BigDecimal("20000.00"));
        cashCartLine.setTotalInterest(new BigDecimal("0.00"));

        CartLine financedCartLine = new CartLine();
        financedCartLine.setCart(cart);
        financedCartLine.setVehicle(vehicle);
        financedCartLine.setQuantity(1);
        financedCartLine.setFinancingSelected(true);
        financedCartLine.setDownPayment(new BigDecimal("3000.00"));
        financedCartLine.setAnnualRatePercent(6.5);
        financedCartLine.setTermMonths(48);
        financedCartLine.setMonthlyPayment(new BigDecimal("398.88"));
        financedCartLine.setLineTotalCost(new BigDecimal("22146.24"));
        financedCartLine.setTotalInterest(new BigDecimal("5146.24"));

        OrderStatus pending = new OrderStatus();
        pending.setOrderStatusId(1);
        pending.setOrderStatusName("PENDING");

        Authentication authentication = org.mockito.Mockito.mock(Authentication.class);
        SecurityContext securityContext = org.mockito.Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(authentication.isAuthenticated()).thenReturn(true);
        SecurityContextHolder.setContext(securityContext);

        when(cartsRepository.findByCartId(15)).thenReturn(Optional.of(cart));
        when(userRepository.findByUserId(77)).thenReturn(Optional.of(user));
        when(cartLineRepository.findByCartCartIdOrderByCartLineIdAsc(15))
                .thenReturn(List.of(cashCartLine, financedCartLine));
        when(orderStatusRepository.findByOrderStatusNameIgnoreCase("PENDING")).thenReturn(Optional.of(pending));
        when(cartStatusRepository.findByCartStatusNameIgnoreCase("CHECKED_OUT")).thenReturn(Optional.of(checkedOutStatus));
        when(ordersRepository.save(any(Orders.class))).thenAnswer(invocation -> {
            Orders savedOrder = invocation.getArgument(0);
            if (savedOrder.getOrderId() == 0) {
                savedOrder.setOrderId(901);
            }
            return savedOrder;
        });

        Orders created = orderService.createOrderFromCart(15);

        assertEquals(new BigDecimal("48875.25"), created.getTotalAmount());
        assertEquals(1, vehicle.getAmountInStock());

        ArgumentCaptor<OrderLine> orderLineCaptor = ArgumentCaptor.forClass(OrderLine.class);
        verify(orderLineRepository, times(2)).save(orderLineCaptor.capture());

        List<OrderLine> savedLines = orderLineCaptor.getAllValues();
        assertFalse(savedLines.get(0).isFinancingSelected());
        assertEquals(new BigDecimal("20000.00"), savedLines.get(0).getLineTotalCost());

        assertTrue(savedLines.get(1).isFinancingSelected());
        assertEquals(new BigDecimal("3000.00"), savedLines.get(1).getDownPayment());
        assertEquals(6.5, savedLines.get(1).getAnnualRatePercent());
        assertEquals(48, savedLines.get(1).getTermMonths());
        assertEquals(new BigDecimal("398.88"), savedLines.get(1).getMonthlyPayment());
        assertEquals(new BigDecimal("22146.24"), savedLines.get(1).getLineTotalCost());
        assertEquals(new BigDecimal("5146.24"), savedLines.get(1).getTotalInterest());
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
