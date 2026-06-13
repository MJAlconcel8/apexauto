package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Table(name = "searchHistory")
@Entity
public class SearchHistory {
    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private int searchHistoryId;

    @Setter
    @Getter
    @Column(nullable = false)
    private String searchQuery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Setter
    @Getter
    private User user;

}
