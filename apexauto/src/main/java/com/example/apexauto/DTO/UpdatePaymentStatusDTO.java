package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// This DTO carries the new status for an existing payment.
public class UpdatePaymentStatusDTO {

    private int paymentStatusId;
}
