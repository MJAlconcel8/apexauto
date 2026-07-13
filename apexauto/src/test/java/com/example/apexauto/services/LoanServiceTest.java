package com.example.apexauto.services;

import com.example.apexauto.DTO.LoanCalculationResponseDTO;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.repository.OrdersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock
    private OrdersRepository ordersRepository;

    private LoanService loanService;

    @BeforeEach
    void setUp() {
        loanService = new LoanService(ordersRepository);
    }

    @Test
    void calculateLoanForAmount_zeroInterestReturnsExpectedTotals() {
        LoanCalculationResponseDTO result = loanService.calculateLoanForAmount(
                new BigDecimal("12000.00"),
                new BigDecimal("2000.00"),
                0,
                20
        );

        assertEquals(0, result.getOrderId());
        assertEquals(new BigDecimal("12000.00"), result.getVehiclePrice());
        assertEquals(new BigDecimal("2000.00"), result.getDownPayment());
        assertEquals(new BigDecimal("10000.00"), result.getLoanAmount());
        assertEquals(new BigDecimal("500.00"), result.getMonthlyPayment());
        assertEquals(new BigDecimal("12000.00"), result.getTotalCost());
        assertEquals(BigDecimal.ZERO, result.getTotalInterest());
    }

    @Test
    void calculateLoan_setsOrderIdForExistingOrder() {
        Orders order = new Orders();
        order.setOrderId(33);
        order.setTotalAmount(new BigDecimal("15000.00"));

        when(ordersRepository.findByOrderId(33)).thenReturn(Optional.of(order));

        LoanCalculationResponseDTO result = loanService.calculateLoan(
                33,
                new BigDecimal("3000.00"),
                0,
                24
        );

        assertEquals(33, result.getOrderId());
        assertEquals(new BigDecimal("15000.00"), result.getVehiclePrice());
        assertEquals(new BigDecimal("500.00"), result.getMonthlyPayment());
        assertEquals(new BigDecimal("15000.00"), result.getTotalCost());
    }

    @Test
    void calculateLoanForAmount_rejectsNonPositiveVehiclePrice() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> loanService.calculateLoanForAmount(BigDecimal.ZERO, BigDecimal.ZERO, 0, 12)
        );

        assertEquals("Vehicle price must be greater than zero", exception.getMessage());
    }
}

