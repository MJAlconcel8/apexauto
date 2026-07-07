package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// This DTO carries optional payment fields that can be updated.
public class UpdatePaymentDTO {

    private Integer paymentStatusId;
    private String paymentMethod;
    private Date paymentDate;
}
