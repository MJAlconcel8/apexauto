package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(
        name = "order_status",
        uniqueConstraints = @UniqueConstraint(name = "uk_order_status_name", columnNames = "order_status_name")
)
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatus {

    @Getter
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "order_status_id", nullable = false)
    private int orderStatusId;

    @Getter
    @Setter
    @Column(name = "order_status_name", nullable = false, unique = true)
    private String orderStatusName;
}
