package com.example.apexauto.repository;

import com.example.apexauto.entity.Favourites;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// This is the FavouritesRepository interface that extends JpaRepository to provide basic CRUD operations for the Favourites entity.
public interface FavouritesRepository extends JpaRepository<Favourites, Integer> {

    // This method retrieves a list of Favourites for a given user ID. It uses the user ID to find all favourites associated with that user.
    List<Favourites> findByUserUserIdOrderByFavouriteIdDesc(int userId);

    // This optional method retrieves a Favourites entry for a given user ID and vehicle ID. It uses the user ID and vehicle ID to find the specific favourite entry.
    Optional<Favourites> findByUserUserIdAndVehicleVehicleId(int userId, int vehicleId);

    // This method checks if a Favourites entry exists for a given user ID and vehicle ID. It returns true if the entry exists, otherwise false.
    boolean existsByUserUserIdAndVehicleVehicleId(int userId, int vehicleId);
}
