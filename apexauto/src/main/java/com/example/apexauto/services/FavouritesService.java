package com.example.apexauto.services;

import com.example.apexauto.entity.Favourites;
import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.FavouritesRepository;
import com.example.apexauto.repository.UserRepository;
import com.example.apexauto.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// This is the FavouritesService class that provides methods to manage the favourites of users. It uses the FavouritesRepository, UserRepository, and VehicleRepository to perform CRUD operations on the Favourites entity.
@Service
public class FavouritesService {

    // This private final field holds the FavouritesRepository instance, which is used to perform CRUD operations on the Favourites entity.
    private final FavouritesRepository favouritesRepository;
    // This private final field holds the UserRepository instance, which is used to perform CRUD operations on the User entity.
    private final VehicleRepository vehicleRepository;
    // This private final field holds the UserRepository instance, which is used to perform CRUD operations on the User entity.
    private final UserRepository userRepository;

    // This constructor initializes the FavouritesService with the provided FavouritesRepository, VehicleRepository, and UserRepository instances.
    public FavouritesService(FavouritesRepository favouritesRepository, VehicleRepository vehicleRepository, UserRepository userRepository) {
        this.favouritesRepository = favouritesRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    // This method adds a vehicle to the user's favourites. It first checks if the user and vehicle exist, then checks if the favourite already exists. If not, it creates a new Favourites entry and saves it to the database.
    @Transactional
    public Favourites addFavourite(int userId, int vehicleId) {
        User user = validateUserExists(userId);
        Vehicle vehicle = validateVehicleExists(vehicleId);

        if (favouritesRepository.existsByUserUserIdAndVehicleVehicleId(userId, vehicleId)) {
            throw new IllegalArgumentException("Vehicle already exists in favourites");
        }

        Favourites favourites = new Favourites();
        favourites.setUser(user);
        favourites.setVehicle(vehicle);

        return favouritesRepository.save(favourites);
    }

    // This method removes a favourite vehicle for a given user ID and vehicle ID. It uses the FavouritesRepository to find the favourite by user ID and vehicle ID, and if found, deletes it from the repository.
    @Transactional
    public void removeFavourite(int userId, int vehicleId) {
        validateUserExists(userId);
        validateVehicleExists(vehicleId);

        Favourites favourites = favouritesRepository.findByUserUserIdAndVehicleVehicleId(userId, vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Favourite not found"));

        favouritesRepository.delete(favourites);
    }

    // This method retrieves a list of favourite vehicles for a given user ID. It uses the FavouritesRepository to find the favourites by user ID and returns the list of Favourites.
    @Transactional(readOnly = true)
    public List<Favourites> getFavouritesByUserId(int userId) {
        validateUserExists(userId);
        return favouritesRepository.findByUserUserIdOrderByFavouriteIdDesc(userId);
    }

    // This method retrieves a specific favourite vehicle for a given user ID and vehicle ID. It uses the FavouritesRepository to find the favourite by user ID and vehicle ID, and if found, returns the Favourites object.
    @Transactional(readOnly = true)
    public Favourites getFavouriteByUserIdAndVehicleId(int userId, int vehicleId) {
        validateUserExists(userId);
        validateVehicleExists(vehicleId);

        return favouritesRepository.findByUserUserIdAndVehicleVehicleId(userId, vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Favourite not found"));
    }

    // This private method validates if a user exists in the database by their user ID. If the user does not exist, it throws an IllegalArgumentException.
    private User validateUserExists(int userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    // This private method validates if a vehicle exists in the database by its vehicle ID. If the vehicle does not exist, it throws an IllegalArgumentException.
    private Vehicle validateVehicleExists(int vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
    }
}
