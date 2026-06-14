package com.example.apexauto.repository;

import com.example.apexauto.entity.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// This is the SearchHistoryRepository interface that extends JpaRepository to provide basic CRUD operations for the SearchHistory entity. It also includes custom methods to find search history entries by user ID and to find a specific search history entry by its ID and user ID.
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Integer> {

	// This method allows you to find all search history entries for a specific user ID, ordered by the search history ID in descending order, which can be useful for displaying a user's search history in reverse chronological order.
	List<SearchHistory> findByUserUserIdOrderBySearchHistoryIdDesc(int userId);

	// This method allows you to find a specific search history entry by its ID and the associated user ID, which can be useful for retrieving or managing individual search history records.
	Optional<SearchHistory> findBySearchHistoryIdAndUserUserId(int searchHistoryId, int userId);

	// This method allows you to delete all search history entries associated with a specific user ID, which can be useful for account deletion or data cleanup.
	void deleteByUserUserId(int userId);
}
