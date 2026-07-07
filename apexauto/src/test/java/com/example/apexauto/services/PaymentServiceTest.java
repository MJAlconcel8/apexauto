package com.example.apexauto.services;

import com.example.apexauto.DTO.CreatePaymentDTO;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.entity.Payment;
import com.example.apexauto.repository.OrdersRepository;
import com.example.apexauto.repository.PaymentRepository;
import com.example.apexauto.repository.PaymentStatusRepository;
import com.example.apexauto.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentStatusRepository paymentStatusRepository;

    @Mock
    private OrdersRepository ordersRepository;

    @Mock
    private UserRepository userRepository;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                paymentRepository,
                paymentStatusRepository,
                ordersRepository,
                userRepository
        );
    }

    @Test
    void createPayment_rejectsDuplicatePaymentForOrder() {
        Orders order = new Orders();
        order.setOrderId(100);

        CreatePaymentDTO request = new CreatePaymentDTO();
        request.setOrderId(100);
        request.setPaymentMethod("CREDIT_CARD");

        when(ordersRepository.findByOrderId(100)).thenReturn(Optional.of(order));
        when(paymentRepository.existsByOrderOrderId(100)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> paymentService.createPayment(request)
        );

        assertEquals("Payment already exists for this order", exception.getMessage());
        verify(paymentStatusRepository, never()).findByPaymentStatusNameIgnoreCase("PENDING");
        verify(paymentStatusRepository, never()).findByPaymentStatusId(anyInt());
        verify(paymentRepository, never()).save(any(Payment.class));
    }
}
