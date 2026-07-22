package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

// This DTO is used to carry the data required when creating or updating a vehicle.
@Getter
@Setter
@NoArgsConstructor
public class CreateVehicleDTO {

    private String brand;
    private String make;
    private String model;
    private int year;
    private String color;
    private int doors;
    private int seats;
    private double emissionScore;
    private double fuelUsage;
    private double mileage;
    private boolean isOnSale;
    private boolean isInStock;
    private Integer amountInStock;
    private BigDecimal price;
    private String imageUrl;
}

