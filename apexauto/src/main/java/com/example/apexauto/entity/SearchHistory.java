package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
@AllArgsConstructor
@Table(name = "searchHistory")
@Entity
public class SearchHistory {
    // Primary key for the search history entry
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private int searchHistoryId;

    // The search query that the user entered
    @Column(nullable = false)
    private String searchQuery;

    // The foreign key relationship to the User entity, indicating which user made the search
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}
