package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO used to add a vehicle to an existing order.
@Getter
@Setter
@NoArgsConstructor
public class CreateOrderLineDTO {

    private int vehicleId;
}
