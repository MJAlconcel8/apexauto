package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// This DTO is used to represent the data required to create a new search history entry, including the search query string.
public class CreateSearchHistoryEntryDTO {

    private String searchQuery;
}

