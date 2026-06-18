package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// This DTO is used to represent the data returned in response to requests for vehicle history entries, including the vehicle history ID, user ID, vehicle ID, and comments.
public class VehicleHistoryResponseDTO {

    private int vehicleHistoryId;
    private int userId;
    private int vehicleId;
    private String vehicleHistoryComments;
}

