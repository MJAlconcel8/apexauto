package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// This DTO represents the data returned for a favourite vehicle record.
public class FavouritesResponseDTO {

    private int favouriteId;
    private int userId;
    private int vehicleId;
}
