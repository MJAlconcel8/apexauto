package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

// DTO returned for order requests.
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponseDTO {

    private int orderId;
    private int userId;
    private String userFullName;
    private int orderStatusId;
    private String orderStatusName;
    private BigDecimal totalAmount;
    private Date deliveryDate;
    private List<OrderLineResponseDTO> orderLines;
}
