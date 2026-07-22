package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

// DTO returned for each vehicle inside a cart.
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CartLineResponseDTO {

    private int cartLineId;
    private int cartId;
    private int vehicleId;
    private String brand;
    private String make;
    private String model;
    private int year;
    private BigDecimal price;
    private int quantity;
    private boolean financingSelected;
    private BigDecimal downPayment;
    private Double annualRatePercent;
    private Integer termMonths;
    private BigDecimal monthlyPayment;
    private BigDecimal lineTotalCost;
    private BigDecimal totalInterest;
    private String imageUrl;
}