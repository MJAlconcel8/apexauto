package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

// DTO used when updating editable order fields.
@Getter
@Setter
@NoArgsConstructor
public class UpdateOrderDTO {

    private Integer orderStatusId;
    private Date deliveryDate;
}
