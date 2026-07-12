package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

// DTO used when creating a cart with zero or more vehicles.
@Getter
@Setter
@NoArgsConstructor
public class CreateCartDTO {

    private int userId;
    private Integer cartStatusId;
    private List<Integer> vehicleIds;
}