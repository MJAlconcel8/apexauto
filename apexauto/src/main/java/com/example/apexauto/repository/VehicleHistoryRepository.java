package com.example.apexauto.repository;

import com.example.apexauto.entity.VehicleHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleHistoryRepository extends JpaRepository<VehicleHistory, Integer> {

    // This method retrieves all vehicle history entries from the database and orders them by their ID in descending order, which means the most recent entries will be returned first.
    List<VehicleHistory> findAllByOrderByVehicleHistoryIdDesc();

    // This method retrieves all vehicle history entries associated with a specific user ID and orders them by their ID in descending order, allowing you to see the most recent entries for that user first.
    List<VehicleHistory> findByUserUserIdOrderByVehicleHistoryIdDesc(int userId);

    // This method retrieves all vehicle history entries associated with a specific vehicle ID and orders them by their ID in descending order, allowing you to see the most recent entries for that vehicle first.
    List<VehicleHistory> findByVehicleVehicleIdOrderByVehicleHistoryIdDesc(int vehicleId);

    // This method retrieves a specific vehicle history entry based on the vehicle history ID and the user ID. It returns an Optional, which means it may or may not contain a VehicleHistory object, depending on whether a matching entry is found in the database.
    Optional<VehicleHistory> findByVehicleHistoryIdAndUserUserId(int vehicleHistoryId, int userId);

    // This method that allows you to delete all vehicle history entries associated with a specific user ID. This can be useful for account deletion or data cleanup purposes, ensuring that all vehicle history records related to a user are removed from the database when necessary.
    void deleteByUserUserId(int userId);

    // This method allows you to delete all vehicle history entries associated with a specific vehicle ID. This can be useful for data cleanup purposes, ensuring that all vehicle history records related to a vehicle are removed from the database when necessary.
    void deleteByVehicleVehicleId(int vehicleId);

    // This method allows you to delete all vehicle history entries in the database. This can be useful for data cleanup purposes, ensuring that all vehicle history records are removed from the database when necessary.
    void deleteAllBy();
    
}
