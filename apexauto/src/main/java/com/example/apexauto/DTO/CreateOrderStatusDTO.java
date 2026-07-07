package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO used to create a reusable order status.
@Getter
@Setter
@NoArgsConstructor
public class CreateOrderStatusDTO {

    private String orderStatusName;
}
