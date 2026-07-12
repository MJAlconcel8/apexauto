package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "cart_line")
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class CartLine {

    @Getter
    @Setter
    @EmbeddedId
    private CartLineId id;

    @Getter
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("cartId")
    @JoinColumn(name = "cart_id", nullable = false)
    private Carts cart;

    @Getter
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("vehicleId")
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
}