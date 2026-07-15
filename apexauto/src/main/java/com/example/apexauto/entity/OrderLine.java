package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Table(name = "order_line")
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class OrderLine {

    @Getter
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_line_id")
    private Integer orderLineId;

    @Getter
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Orders order;

    @Getter
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Getter
    @Setter
    @Column(name = "quantity", nullable = false)
    private int quantity = 1;

    @Getter
    @Setter
    @Column(name = "financing_selected", nullable = false)
    private boolean financingSelected;

    @Getter
    @Setter
    @Column(name = "down_payment", precision = 12, scale = 2)
    private BigDecimal downPayment;

    @Getter
    @Setter
    @Column(name = "annual_rate_percent")
    private Double annualRatePercent;

    @Getter
    @Setter
    @Column(name = "term_months")
    private Integer termMonths;

    @Getter
    @Setter
    @Column(name = "monthly_payment", precision = 12, scale = 2)
    private BigDecimal monthlyPayment;

    @Getter
    @Setter
    @Column(name = "line_total_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotalCost;

    @Getter
    @Setter
    @Column(name = "total_interest", precision = 12, scale = 2)
    private BigDecimal totalInterest;
}
