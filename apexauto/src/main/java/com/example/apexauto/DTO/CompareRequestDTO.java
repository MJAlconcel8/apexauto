package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

// This DTO carries the list of vehicle IDs (2–3) to compare.
@Getter
@Setter
@NoArgsConstructor
public class CompareRequestDTO {
    private List<Integer> vehicleIds;
}
