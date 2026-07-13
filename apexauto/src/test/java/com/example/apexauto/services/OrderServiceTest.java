package com.example.apexauto.services;

import com.example.apexauto.DTO.CreateOrderDTO;
import com.example.apexauto.entity.OrderLine;
import com.example.apexauto.entity.OrderStatus;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.OrderLineRepository;
import com.example.apexauto.repository.OrderStatusRepository;
import com.example.apexauto.repository.OrdersRepository;
import com.example.apexauto.repository.PaymentRepository;
import com.example.apexauto.repository.UserRepository;
import com.example.apexauto.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
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

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                ordersRepository,
                orderStatusRepository,
                orderLineRepository,
                userRepository,
                vehicleRepository,
                paymentRepository
        );
    }

    @Test
    void createOrder_createsOrderLinesAndReducesStock() {
        User user = new User();
        user.setUserId(1);

        OrderStatus pending = new OrderStatus();
        pending.setOrderStatusId(1);
        pending.setOrderStatusName("PENDING");

        Vehicle firstVehicle = vehicle(10, "25000.00", 2);
        Vehicle secondVehicle = vehicle(20, "30000.00", 1);

        CreateOrderDTO request = new CreateOrderDTO();
        request.setUserId(1);
        request.setVehicleIds(List.of(10, 20));

        when(userRepository.findByUserId(1)).thenReturn(Optional.of(user));
        when(orderStatusRepository.findByOrderStatusNameIgnoreCase("PENDING")).thenReturn(Optional.of(pending));
        when(vehicleRepository.findById(10)).thenReturn(Optional.of(firstVehicle));
        when(vehicleRepository.findById(20)).thenReturn(Optional.of(secondVehicle));
        when(ordersRepository.save(any(Orders.class))).thenAnswer(invocation -> {
            Orders order = invocation.getArgument(0);
            order.setOrderId(100);
            return order;
        });
        when(orderLineRepository.save(any(OrderLine.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Orders result = orderService.createOrder(request);

        assertEquals(100, result.getOrderId());
        assertSame(user, result.getUser());
        assertSame(pending, result.getOrderStatus());
        assertEquals(0, new BigDecimal("55000.00").compareTo(result.getTotalAmount()));
        assertEquals(1, firstVehicle.getAmountInStock());
        assertTrue(firstVehicle.isInStock());
        assertEquals(0, secondVehicle.getAmountInStock());
        assertFalse(secondVehicle.isInStock());

        ArgumentCaptor<OrderLine> orderLineCaptor = ArgumentCaptor.forClass(OrderLine.class);
        verify(orderLineRepository, times(2)).save(orderLineCaptor.capture());
        assertEquals(List.of(10, 20), orderLineCaptor.getAllValues().stream()
                .map(orderLine -> orderLine.getVehicle().getVehicleId())
                .toList());
        verify(vehicleRepository).save(firstVehicle);
        verify(vehicleRepository).save(secondVehicle);
        verify(ordersRepository, times(2)).save(any(Orders.class));
    }

    @Test
    void createOrder_rejectsDuplicateVehicleIds() {
        User user = new User();
        user.setUserId(1);

        OrderStatus pending = new OrderStatus();
        pending.setOrderStatusName("PENDING");

        CreateOrderDTO request = new CreateOrderDTO();
        request.setUserId(1);
        request.setVehicleIds(List.of(10, 10));

        when(userRepository.findByUserId(1)).thenReturn(Optional.of(user));
        when(orderStatusRepository.findByOrderStatusNameIgnoreCase("PENDING")).thenReturn(Optional.of(pending));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> orderService.createOrder(request)
        );

        assertEquals("Duplicate vehicles are not allowed in the same order", exception.getMessage());
        verify(vehicleRepository, never()).findById(10);
        verify(orderLineRepository, never()).save(any(OrderLine.class));
        verify(ordersRepository, never()).save(any(Orders.class));
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

    private Vehicle vehicle(int vehicleId, String price, int amountInStock) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(vehicleId);
        vehicle.setPrice(new BigDecimal(price));
        vehicle.setAmountInStock(amountInStock);
        vehicle.setInStock(amountInStock > 0);
        return vehicle;
    }
}
