package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

// This DTO is returned from POST /vehicles/compare and includes the compared vehicles
// along with the recommended vehicle ID and a human-readable reason.
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CompareResponseDTO {
    private List<VehicleResponseDTO> vehicles;
    private int recommendedVehicleId;
    private String recommendationReason;
}
