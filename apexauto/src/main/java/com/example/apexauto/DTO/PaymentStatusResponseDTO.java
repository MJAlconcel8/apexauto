package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// This DTO represents a payment status response.
public class PaymentStatusResponseDTO {

    private int paymentStatusId;
    private String paymentStatusName;
}
