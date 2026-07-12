package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

// DTO returned for cart requests.
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CartResponseDTO {

    private int cartId;
    private int userId;
    private int cartStatusId;
    private String cartStatusName;
    private int totalItemsInCart;
    private List<CartLineResponseDTO> cartLines;
}