package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// This DTO carries the data required to create a favourite vehicle entry for a user.
public class CreateFavouritesDTO {

    private int userId;
    private int vehicleId;
}
