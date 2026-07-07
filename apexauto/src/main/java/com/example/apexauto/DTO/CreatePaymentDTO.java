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
// This DTO carries the data required to create a new payment.
public class CreatePaymentDTO {

    private int orderId;
    private Integer paymentStatusId;
    private String paymentMethod;
    private Date paymentDate;
}
