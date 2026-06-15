package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.Setter;

// This DTO is used to carry the data for filtering vehicles based on various criteria.
@Getter
@Setter
public class VehicleFilterDTO {

    private String brand;
    private String make;
    private String model;
    private String color;
    private Integer year;
    private Integer minYear;
    private Integer maxYear;
    private Double minPrice;
    private Double maxPrice;
    private Boolean isOnSale;
    private Boolean isInStock;
}

