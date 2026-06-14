package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
@Table(name = "searchHistory")
@Entity
public class SearchHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private int searchHistoryId;

    @Column(nullable = false)
    private String searchQuery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}
