package com.example.apexauto.services;

import com.example.apexauto.entity.OrderLine;
import com.example.apexauto.entity.OrderStatus;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.CartLineRepository;
import com.example.apexauto.repository.CartsRepository;
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

    @Mock
    private CartLineRepository cartLineRepository;

    @Mock
    private CartsRepository cartsRepository;

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
                cartsRepository
        );
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
