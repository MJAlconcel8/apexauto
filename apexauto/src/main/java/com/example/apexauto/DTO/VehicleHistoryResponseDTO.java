package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// This DTO is used to represent the data returned in response to requests for vehicle history entries, including the vehicle history ID, user ID, vehicle ID, comments, and when it was posted.
public class VehicleHistoryResponseDTO {

    private int vehicleHistoryId;
    private int userId;
    private int vehicleId;
    private String vehicleHistoryComments;
    private Date createdAt;
}

