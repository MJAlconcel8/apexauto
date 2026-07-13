package com.example.apexauto.services;

import com.example.apexauto.DTO.LoanCalculationResponseDTO;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.repository.OrdersRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

// This service contains stateless loan calculation logic. Nothing is written to the DB.
@Service
public class LoanService {

    private final OrdersRepository ordersRepository;

    public LoanService(OrdersRepository ordersRepository) {
        this.ordersRepository = ordersRepository;
    }

    // Calculates loan details for an existing order without modifying anything in the DB.
    @Transactional(readOnly = true)
    public LoanCalculationResponseDTO calculateLoan(int orderId, BigDecimal downPayment, double annualRatePercent, int termMonths) {
        Orders order = ordersRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        LoanCalculationResponseDTO calculation = calculateLoanForAmount(
                order.getTotalAmount(),
                downPayment,
                annualRatePercent,
                termMonths
        );

        calculation.setOrderId(orderId);
        return calculation;
    }

    public LoanCalculationResponseDTO calculateLoanForAmount(
            BigDecimal vehiclePrice,
            BigDecimal downPayment,
            double annualRatePercent,
            int termMonths
    ) {
        validateVehiclePrice(vehiclePrice);

        validateInputs(downPayment, annualRatePercent, termMonths, vehiclePrice);
        BigDecimal loanAmount = vehiclePrice.subtract(downPayment);

        BigDecimal monthlyPayment;
        BigDecimal totalCost;
        BigDecimal totalInterest;

        if (annualRatePercent == 0) {
            // Zero-interest loan: divide evenly across months.
            monthlyPayment = loanAmount.divide(BigDecimal.valueOf(termMonths), 2, RoundingMode.HALF_UP);
            totalCost = downPayment.add(loanAmount);
            totalInterest = BigDecimal.ZERO;
        } else {
            // Standard amortising loan formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
            double monthlyRate = annualRatePercent / 100.0 / 12.0;
            double onePlusRtoN = Math.pow(1 + monthlyRate, termMonths);
            double monthlyPaymentDouble = loanAmount.doubleValue()
                    * (monthlyRate * onePlusRtoN)
                    / (onePlusRtoN - 1);

            monthlyPayment = BigDecimal.valueOf(monthlyPaymentDouble).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalLoanCost = monthlyPayment.multiply(BigDecimal.valueOf(termMonths));
            totalCost = downPayment.add(totalLoanCost);
            totalInterest = totalLoanCost.subtract(loanAmount).setScale(2, RoundingMode.HALF_UP);
        }

        return new LoanCalculationResponseDTO(
                0,
                vehiclePrice.setScale(2, RoundingMode.HALF_UP),
                downPayment.setScale(2, RoundingMode.HALF_UP),
                loanAmount.setScale(2, RoundingMode.HALF_UP),
                annualRatePercent,
                termMonths,
                monthlyPayment,
                totalCost.setScale(2, RoundingMode.HALF_UP),
                totalInterest
        );
    }

    private void validateVehiclePrice(BigDecimal vehiclePrice) {
        if (vehiclePrice == null) {
            throw new IllegalArgumentException("Vehicle price must not be null");
        }

        if (vehiclePrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Vehicle price must be greater than zero");
        }
    }

    private void validateInputs(BigDecimal downPayment, double annualRatePercent, int termMonths, BigDecimal vehiclePrice) {
        if (downPayment == null || downPayment.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Down payment must be zero or greater");
        }

        if (downPayment.compareTo(vehiclePrice) >= 0) {
            throw new IllegalArgumentException("Down payment must be less than the vehicle price");
        }

        if (annualRatePercent < 0) {
            throw new IllegalArgumentException("Annual rate must be zero or greater");
        }

        if (termMonths <= 0) {
            throw new IllegalArgumentException("Term months must be a positive value");
        }
    }
}


