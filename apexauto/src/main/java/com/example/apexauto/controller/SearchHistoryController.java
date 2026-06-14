package com.example.apexauto.controller;

import com.example.apexauto.DTO.CreateSearchHistoryEntryDTO;
import com.example.apexauto.DTO.SearchHistoryEntryResponseDTO;
import com.example.apexauto.entity.SearchHistory;
import com.example.apexauto.services.SearchHistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/users/{userId}/search-history")
public class SearchHistoryController {

    private final SearchHistoryService searchHistoryService;

    public SearchHistoryController(SearchHistoryService searchHistoryService) {
        this.searchHistoryService = searchHistoryService;
    }

    // GET /users/{userId}/search-history — returns all search history entries for a user (newest first)
    @GetMapping
    public ResponseEntity<List<SearchHistoryEntryResponseDTO>> getSearchHistoryEntriesByUserId(@PathVariable int userId) {
        try {
            List<SearchHistoryEntryResponseDTO> entries = searchHistoryService.getSearchHistoryEntriesByUserId(userId)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(entries);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /users/{userId}/search-history/{searchHistoryId} — returns a specific search history entry for a user
    @GetMapping("/{searchHistoryId}")
    public ResponseEntity<SearchHistoryEntryResponseDTO> getSearchHistoryEntryByIdForUser(
            @PathVariable int userId,
            @PathVariable int searchHistoryId
    ) {
        try {
            SearchHistory searchHistory = searchHistoryService.getSearchHistoryEntryByIdForUser(userId, searchHistoryId);
            return ResponseEntity.ok(toResponseDTO(searchHistory));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /users/{userId}/search-history — creates a new search history entry for a user
    @PostMapping
    public ResponseEntity<SearchHistoryEntryResponseDTO> createSearchHistoryEntryForUser(
            @PathVariable int userId,
            @RequestBody CreateSearchHistoryEntryDTO request
    ) {
        try {
            SearchHistory saved = searchHistoryService.createSearchHistoryEntryForUser(userId, request.getSearchQuery());
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /users/{userId}/search-history/{searchHistoryId} — deletes one search history entry for a user
    @DeleteMapping("/{searchHistoryId}")
    public ResponseEntity<Void> deleteSearchHistoryEntryByIdForUser(
            @PathVariable int userId,
            @PathVariable int searchHistoryId
    ) {
        try {
            searchHistoryService.deleteSearchHistoryEntryByIdForUser(userId, searchHistoryId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /users/{userId}/search-history — deletes all search history entries for a user
    @DeleteMapping
    public ResponseEntity<Void> deleteAllSearchHistoryEntriesByUserId(@PathVariable int userId) {
        try {
            searchHistoryService.deleteAllSearchHistoryEntriesByUserId(userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private SearchHistoryEntryResponseDTO toResponseDTO(SearchHistory searchHistory) {
        return new SearchHistoryEntryResponseDTO(
                searchHistory.getSearchHistoryId(),
                searchHistory.getUser().getUserId(),
                searchHistory.getSearchQuery()
        );
    }

    private ResponseStatusException toHttpException(IllegalArgumentException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}

