package com.example.apexauto.services;

import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.entity.VehicleHistory;
import com.example.apexauto.repository.UserRepository;
import com.example.apexauto.repository.VehicleHistoryRepository;
import com.example.apexauto.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VehicleHistoryService {

    private final VehicleHistoryRepository vehicleHistoryRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    public VehicleHistoryService(
            VehicleHistoryRepository vehicleHistoryRepository,
            UserRepository userRepository,
            VehicleRepository vehicleRepository
    ) {
        this.vehicleHistoryRepository = vehicleHistoryRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }

    // This method retrieves all vehicle history entries made by a specific user by their user ID. It uses the VehicleHistoryRepository to find the vehicle history entries associated with the given user ID.
    @Transactional(readOnly = true)
    public List<VehicleHistory> getVehicleHistoryEntriesByUserId(int userId) {
        validateUserExists(userId);
        return vehicleHistoryRepository.findByUserUserIdOrderByVehicleHistoryIdDesc(userId);
    }

    // This method retrieves all vehicle history comments for a specific vehicle across all users (newest first).
    @Transactional(readOnly = true)
    public List<String> getVehicleHistoryCommentsByVehicleId(int vehicleId) {
        validateVehicleExists(vehicleId);

        return vehicleHistoryRepository
                .findByVehicleVehicleIdOrderByVehicleHistoryIdDesc(vehicleId)
                .stream()
                .map(VehicleHistory::getVehicleHistoryComments)
                .toList();
    }

    // This method retrieves all vehicle history entries in the system, ordered by the most recent entry first. It uses the VehicleHistoryRepository to find all vehicle history entries and order them by their ID in descending order.
    @Transactional(readOnly = true)
    public List<VehicleHistory> getVehicleHistoryEntriesForAllVehicles() {
        return vehicleHistoryRepository.findAllByOrderByVehicleHistoryIdDesc();
    }

    // This method retrieves a specific vehicle history entry made by a user by the vehicle history ID and user ID. It uses the VehicleHistoryRepository to find the vehicle history entry that matches the given vehicle history ID and user ID.
    @Transactional(readOnly = true)
    public VehicleHistory getVehicleHistoryEntryByIdForUser(int userId, int vehicleHistoryId) {
        validateUserExists(userId);
        return vehicleHistoryRepository.findByVehicleHistoryIdAndUserUserId(vehicleHistoryId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle history not found"));
    }

    // This method creates a new vehicle history entry by a user. It first validates that the user exists, then creates a new VehicleHistory object, sets the user and vehicle, and saves it to the database using the VehicleHistoryRepository.
    @Transactional
    public VehicleHistory createVehicleHistoryEntryByUser(int userId, int vehicleId, String vehicleHistoryComments) {
        User user = validateUserExists(userId);
        Vehicle vehicle = validateVehicleExists(vehicleId);
        String normalizedComments = normalizeVehicleHistoryComments(vehicleHistoryComments);

        VehicleHistory vehicleHistory = new VehicleHistory();
        vehicleHistory.setUser(user);
        vehicleHistory.setVehicle(vehicle);
        vehicleHistory.setVehicleHistoryComments(normalizedComments);

        return vehicleHistoryRepository.save(vehicleHistory);
    }

    // This method deletes all vehicle history entries made by a specific user by their user ID. It first validates that the user exists, then deletes all vehicle history entries associated with the given user ID using the VehicleHistoryRepository.
    @Transactional
    public void deleteVehicleHistoryEntryByIdForUser(int userId, int vehicleHistoryId) {
        VehicleHistory vehicleHistory = getVehicleHistoryEntryByIdForUser(userId, vehicleHistoryId);
        vehicleHistoryRepository.delete(vehicleHistory);
    }

    // This method deletes a specific vehicle history entry made by a user by the vehicle history ID and user ID. It first validates that the user exists, then deletes all vehicle history entries associated with the given user ID using the VehicleHistoryRepository.
    @Transactional
    public void deleteAllVehicleHistoryEntriesByUserId(int userId) {
        validateUserExists(userId);
        vehicleHistoryRepository.deleteByUserUserId(userId);
    }

    // This method deletes all vehicle history comments for a specific vehicle.
    @Transactional
    public void deleteAllVehicleHistoryEntriesByVehicleId(int vehicleId) {
        validateVehicleExists(vehicleId);
        vehicleHistoryRepository.deleteByVehicleVehicleId(vehicleId);
    }

    // This method deletes all vehicle history comments across all vehicles.
    @Transactional
    public void deleteAllVehicleHistoryEntriesForAllVehicles() {
        vehicleHistoryRepository.deleteAllBy();
    }

    private User validateUserExists(int userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private Vehicle validateVehicleExists(int vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
    }

    private String normalizeVehicleHistoryComments(String vehicleHistoryComments) {
        if (vehicleHistoryComments == null || vehicleHistoryComments.isBlank()) {
            throw new IllegalArgumentException("Vehicle history comments must not be blank");
        }

        return vehicleHistoryComments.trim();
    }
}
