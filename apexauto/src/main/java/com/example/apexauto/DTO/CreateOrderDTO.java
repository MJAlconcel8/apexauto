package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

// DTO used when creating an order with one or more vehicles.
@Getter
@Setter
@NoArgsConstructor
public class CreateOrderDTO {

    private int userId;
    private Integer orderStatusId;
    private List<Integer> vehicleIds;
    private Date deliveryDate;
}
