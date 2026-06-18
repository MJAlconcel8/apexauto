package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// This DTO is used to represent the data required to create a new vehicle history entry, including the vehicle ID and comments.
public class CreateVehicleHistoryDTO {

    private int vehicleId;
    private String vehicleHistoryComments;
}

