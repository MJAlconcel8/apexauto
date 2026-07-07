package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO used when changing only the order status.
@Getter
@Setter
@NoArgsConstructor
public class UpdateOrderStatusDTO {

    private int orderStatusId;
}
