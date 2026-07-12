package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO used to add a vehicle to an existing cart.
@Getter
@Setter
@NoArgsConstructor
public class CreateCartLineDTO {

    private int vehicleId;
}