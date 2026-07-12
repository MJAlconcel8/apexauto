package com.example.apexauto.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@AllArgsConstructor
@NoArgsConstructor
public class CartLineId implements Serializable {

    @Getter
    @Setter
    @Column(name = "cart_id")
    private Integer cartId;

    @Getter
    @Setter
    @Column(name = "vehicle_id")
    private Integer vehicleId;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CartLineId that)) {
            return false;
        }
        return Objects.equals(cartId, that.cartId) && Objects.equals(vehicleId, that.vehicleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cartId, vehicleId);
    }
}