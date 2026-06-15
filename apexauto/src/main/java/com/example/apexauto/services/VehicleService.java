package com.example.apexauto.services;

import com.example.apexauto.DTO.VehicleFilterDTO;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.VehicleRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class VehicleService {

    // This variable holds the VehicleRepository bean used to access vehicle data from the database.
    private final VehicleRepository vehicleRepository;

    // Constructor that injects the VehicleRepository dependency.
    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    // Retrieves all vehicles from the database.
    @Transactional(readOnly = true)
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    // Retrieves a single vehicle by its ID. Throws an exception if the vehicle is not found.
    @Transactional(readOnly = true)
    public Vehicle getVehicleById(int vehicleId) {
        return findVehicleOrThrow(vehicleId);
    }

    // Persists a new vehicle entity to the database.
    @Transactional
    public Vehicle createVehicle(Vehicle vehicle) {
        validateVehicle(vehicle);
        return vehicleRepository.save(vehicle);
    }

    // Updates an existing vehicle identified by vehicleId with the data from the provided Vehicle entity.
    @Transactional
    public Vehicle updateVehicle(int vehicleId, Vehicle incoming) {
        validateVehicle(incoming);
        Vehicle vehicle = findVehicleOrThrow(vehicleId);

        vehicle.setBrand(incoming.getBrand());
        vehicle.setMake(incoming.getMake());
        vehicle.setModel(incoming.getModel());
        vehicle.setYear(incoming.getYear());
        vehicle.setColor(incoming.getColor());
        vehicle.setDoors(incoming.getDoors());
        vehicle.setSeats(incoming.getSeats());
        vehicle.setEmissionScore(incoming.getEmissionScore());
        vehicle.setFuelUsage(incoming.getFuelUsage());
        vehicle.setMillage(incoming.getMillage());
        vehicle.setOnSale(incoming.isOnSale());
        vehicle.setInStock(incoming.isInStock());
        vehicle.setPrice(incoming.getPrice());

        return vehicleRepository.save(vehicle);
    }

    // Deletes the vehicle identified by the given vehicleId. Throws an exception if the vehicle is not found.
    @Transactional
    public void deleteVehicle(int vehicleId) {
        Vehicle vehicle = findVehicleOrThrow(vehicleId);
        vehicleRepository.delete(vehicle);
    }

    // Matches all specified filter criteria and returns a list of matching Vehicle entities.
    @Transactional(readOnly = true)
    public List<Vehicle> filterVehicles(VehicleFilterDTO filter) {
        if (filter.getMinYear() != null && filter.getMaxYear() != null) {
            validateRange(filter.getMinYear(), filter.getMaxYear(), "year");
        }
        if (filter.getMinPrice() != null && filter.getMaxPrice() != null) {
            validateRange(filter.getMinPrice(), filter.getMaxPrice(), "price");
        }

        Specification<Vehicle> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getBrand() != null && !filter.getBrand().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), filter.getBrand().toLowerCase()));
            }
            if (filter.getMake() != null && !filter.getMake().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("make")), filter.getMake().toLowerCase()));
            }
            if (filter.getModel() != null && !filter.getModel().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("model")), filter.getModel().toLowerCase()));
            }
            if (filter.getColor() != null && !filter.getColor().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("color")), filter.getColor().toLowerCase()));
            }
            // Exact year takes priority; otherwise use minYear / maxYear range
            if (filter.getYear() != null) {
                predicates.add(cb.equal(root.get("year"), filter.getYear()));
            } else {
                if (filter.getMinYear() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("year"), filter.getMinYear()));
                }
                if (filter.getMaxYear() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("year"), filter.getMaxYear()));
                }
            }
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }
            if (filter.getIsOnSale() != null) {
                predicates.add(cb.equal(root.get("isOnSale"), filter.getIsOnSale()));
            }
            if (filter.getIsInStock() != null) {
                predicates.add(cb.equal(root.get("isInStock"), filter.getIsInStock()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return vehicleRepository.findAll(spec);
    }

    // Private helper that retrieves a Vehicle entity by ID or throws an IllegalArgumentException if not found.
    private Vehicle findVehicleOrThrow(int vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle with ID " + vehicleId + " not found"));
    }

    // Private helper that validates a Vehicle entity, throwing an IllegalArgumentException if any required field is invalid.
    private void validateVehicle(Vehicle vehicle) {
        if (vehicle.getBrand() == null || vehicle.getBrand().isBlank()) {
            throw new IllegalArgumentException("Vehicle brand must not be blank");
        }
        if (vehicle.getMake() == null || vehicle.getMake().isBlank()) {
            throw new IllegalArgumentException("Vehicle make must not be blank");
        }
        if (vehicle.getModel() == null || vehicle.getModel().isBlank()) {
            throw new IllegalArgumentException("Vehicle model must not be blank");
        }
        if (vehicle.getYear() <= 0) {
            throw new IllegalArgumentException("Vehicle year must be a positive value");
        }
        if (vehicle.getColor() == null || vehicle.getColor().isBlank()) {
            throw new IllegalArgumentException("Vehicle color must not be blank");
        }
        if (vehicle.getPrice() < 0) {
            throw new IllegalArgumentException("Vehicle price must not be negative");
        }
    }

    // Private helper that validates a numeric range, throwing an IllegalArgumentException if min exceeds max.
    private void validateRange(Number min, Number max, String fieldName) {
        double minValue = min.doubleValue();
        double maxValue = max.doubleValue();

        if (minValue > maxValue) {
            throw new IllegalArgumentException(
                    "Minimum " + fieldName + " (" + min + ") must not exceed maximum " + fieldName + " (" + max + ")"
            );
        }
    }
}

