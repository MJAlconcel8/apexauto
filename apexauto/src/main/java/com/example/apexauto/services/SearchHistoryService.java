package com.example.apexauto.services;

import com.example.apexauto.entity.SearchHistory;
import com.example.apexauto.entity.User;
import com.example.apexauto.repository.SearchHistoryRepository;
import com.example.apexauto.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SearchHistoryService {
    
    // This variable holds the SearchHistoryRepository bean that will be used to access search history data from the database
    private final SearchHistoryRepository searchHistoryRepository;

    // This variable holds the UserRepository bean that will be used to access user data from the database
    private final UserRepository userRepository;
    
    // This is a constructor that takes a SearchHistoryRepository and a UserRepository as parameters and assigns them to the respective fields
    public SearchHistoryService(SearchHistoryRepository searchHistoryRepository, UserRepository userRepository) {
        this.searchHistoryRepository = searchHistoryRepository;
        this.userRepository = userRepository;
    }
    
    // This method retrieves all the search histories for a specific user by their user ID. It uses the SearchHistoryRepository to find the search history entries associated with the given user ID.
    @Transactional(readOnly = true)
    public List<SearchHistory> getSearchHistoryEntriesByUserId(int userId) {
        validateUserExists(userId);
        return searchHistoryRepository.findByUserUserIdOrderBySearchHistoryIdDesc(userId);
    }

    // This method retrieves a specific search history entry for a user by the search history ID and user ID. It uses the SearchHistoryRepository to find the search history entry that matches the given search history ID and user ID.
    @Transactional(readOnly = true)
    public SearchHistory getSearchHistoryEntryByIdForUser(int userId, int searchHistoryId) {
        validateUserExists(userId);
        return searchHistoryRepository.findBySearchHistoryIdAndUserUserId(searchHistoryId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Search history not found"));
    }

    // This method creates a new search history entry for a user. It first validates that the user exists, then creates a new SearchHistory object, sets the user and search query, and saves it to the database using the SearchHistoryRepository.
    @Transactional
    public SearchHistory createSearchHistoryEntryForUser(int userId, String searchQuery) {
        User user = validateUserExists(userId);
        String normalizedSearchQuery = normalizeSearchQuery(searchQuery);

        SearchHistory searchHistory = new SearchHistory();
        searchHistory.setUser(user);
        searchHistory.setSearchQuery(normalizedSearchQuery);

        return searchHistoryRepository.save(searchHistory);
    }

    // This method deletes a specific search history entry for a user by the search history ID and user ID. It first validates that the user exists, then checks if the search history entry exists for the given search history ID and user ID. If it exists, it deletes the entry using the SearchHistoryRepository.
    @Transactional
    public void deleteSearchHistoryEntryByIdForUser(int userId, int searchHistoryId) {
        SearchHistory searchHistory = getSearchHistoryEntryByIdForUser(userId, searchHistoryId);
        searchHistoryRepository.delete(searchHistory);
    }

    // This method deletes all search history entries for a specific user by their user ID. It first validates that the user exists, then retrieves all search history entries for the user and deletes them using the SearchHistoryRepository.
    @Transactional
    public void deleteAllSearchHistoryEntriesByUserId(int userId) {
        validateUserExists(userId);
        searchHistoryRepository.deleteByUserUserId(userId);
    }

    // This private method validates that a user exists in the database by their user ID. It uses the UserRepository to find the user and throws an IllegalArgumentException if the user does not exist.
    private User validateUserExists(int userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

   // This private method normalizes the search query by trimming whitespace and converting it to lowercase. This helps to ensure consistency in how search queries are stored and compared in the database.
    private String normalizeSearchQuery(String searchQuery) {
        if (searchQuery == null || searchQuery.isBlank()) {
            throw new IllegalArgumentException("Search query must not be blank");
        }

        return searchQuery.trim();
    }
}
