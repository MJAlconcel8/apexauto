package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
// This DTO is used to represent the data returned in response to requests for search history entries, including the search history ID and the search query string.
public class SearchHistoryEntryResponseDTO {

    private int searchHistoryId;
    private int userId;
    private String searchQuery;
}

