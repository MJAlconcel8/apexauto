package com.example.apexauto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Table(name = "searchHistory")
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class SearchHistory {
    // Primary key for the search history entry
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    @Getter
    @Setter
    private int searchHistoryId;

    // The search query that the user entered
    @Column(nullable = false)
    @Getter
    @Setter
    private String searchQuery;

    // The foreign key relationship to the User entity, indicating which user made the search
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Getter
    @Setter
    private User user;
}
