package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

// This DTO carries only fields that should be partially updated for a vehicle.
@Getter
@Setter
@NoArgsConstructor
public class PatchVehicleDTO {

    private String brand;
    private String make;
    private String model;
    private Integer year;
    private String color;
    private Integer doors;
    private Integer seats;
    private Double emissionScore;
    private Double fuelUsage;
    private Double mileage;
    private Boolean isOnSale;
    private Boolean isInStock;
    private Integer amountInStock;
    private BigDecimal price;
}

