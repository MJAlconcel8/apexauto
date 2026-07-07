package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO returned for order status requests.
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatusResponseDTO {

    private int orderStatusId;
    private String orderStatusName;
}
