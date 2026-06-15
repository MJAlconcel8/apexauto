package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// This DTO represents the data returned in response to requests for vehicle information.
@Getter
@Setter
@AllArgsConstructor
public class VehicleResponseDTO {

    private int vehicleId;
    private String brand;
    private String make;
    private String model;
    private int year;
    private String color;
    private int doors;
    private int seats;
    private double emissionScore;
    private double fuelUsage;
    private double millage;
    private boolean isOnSale;
    private boolean isInStock;
    private double price;
}

