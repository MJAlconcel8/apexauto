package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

// DTO used to add a vehicle to an existing cart.
@Getter
@Setter
@NoArgsConstructor
public class CreateCartLineDTO {

    private int vehicleId;
    private Integer quantity;
    private boolean financingSelected;
    private BigDecimal downPayment;
    private Double annualRate;
    private Integer termMonths;
}