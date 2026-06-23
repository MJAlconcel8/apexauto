package com.example.apexauto.repository;

import com.example.apexauto.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

// This is the VehicleRepository interface that extends JpaRepository to provide basic CRUD operations for the Vehicle entity. It also extends JpaSpecificationExecutor to allow for more complex queries using specifications.
public interface VehicleRepository extends JpaRepository<Vehicle, Integer>, JpaSpecificationExecutor<Vehicle> {

}
