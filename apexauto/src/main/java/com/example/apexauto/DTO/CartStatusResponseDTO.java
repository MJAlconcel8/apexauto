package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO returned for cart status requests.
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CartStatusResponseDTO {

    private int cartStatusId;
    private String cartStatusName;
}