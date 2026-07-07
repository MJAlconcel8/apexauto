package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// This DTO represents a payment response without exposing the full Order or PaymentStatus entity graph.
public class PaymentResponseDTO {

    private int paymentId;
    private int orderId;
    private int userId;
    private int paymentStatusId;
    private String paymentStatusName;
    private String paymentMethod;
    private Date paymentDate;
}
