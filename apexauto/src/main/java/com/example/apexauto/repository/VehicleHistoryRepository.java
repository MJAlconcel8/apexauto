package com.example.apexauto.repository;

import com.example.apexauto.entity.VehicleHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleHistoryRepository extends JpaRepository<VehicleHistory, Integer> {
}
