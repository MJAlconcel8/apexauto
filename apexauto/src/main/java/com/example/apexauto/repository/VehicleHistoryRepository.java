package com.example.apexauto.repository;

import com.example.apexauto.entity.VehicleHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleHistoryRepository extends JpaRepository<VehicleHistory, Integer> {

    List<VehicleHistory> findAllByOrderByVehicleHistoryIdDesc();

    List<VehicleHistory> findByUserUserIdOrderByVehicleHistoryIdDesc(int userId);

    Optional<VehicleHistory> findByVehicleHistoryIdAndUserUserId(int vehicleHistoryId, int userId);

    void deleteByUserUserId(int userId);

    void deleteByVehicleVehicleId(int vehicleId);

    void deleteAllBy();
    
}
