package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// This DTO carries the data required to create a new review for a vehicle by a user.
@Getter
@Setter
@NoArgsConstructor
public class CreateReviewDTO {

    private int userId;
    private int vehicleId;
    private String reviewComments;
}

