package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

// DTO returned for loan calculation requests. Nothing is saved to the DB.
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoanCalculationResponseDTO {

    private int orderId;
    private BigDecimal vehiclePrice;
    private BigDecimal downPayment;
    private BigDecimal loanAmount;
    private double annualRatePercent;
    private int termMonths;
    private BigDecimal monthlyPayment;
    private BigDecimal totalCost;
    private BigDecimal totalInterest;
}

