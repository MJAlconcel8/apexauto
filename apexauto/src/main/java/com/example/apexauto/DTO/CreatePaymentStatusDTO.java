package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// This DTO carries the data required to create a new payment status.
public class CreatePaymentStatusDTO {

    private String paymentStatusName;
}
