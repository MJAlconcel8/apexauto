package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// This DTO represents the data returned in response to requests for review information.
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponseDTO {

    private int reviewId;
    private int userId;
    private int vehicleId;
    private String reviewComments;
}

