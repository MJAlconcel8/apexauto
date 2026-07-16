package com.example.apexauto.services;

import com.example.apexauto.DTO.CompareResponseDTO;
import com.example.apexauto.DTO.PatchVehicleDTO;
import com.example.apexauto.DTO.VehicleFilterDTO;
import com.example.apexauto.DTO.VehicleResponseDTO;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.VehicleRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

// This class is responsible for handling the business logic related to vehicles, including retrieving, updating, and filtering vehicle data. It interacts with the VehicleRepository to perform database operations and uses specifications to implement dynamic filtering based on various criteria.
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
        vehicle.setInStock(vehicle.getAmountInStock() > 0);
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
        vehicle.setMileage(incoming.getMileage());
        vehicle.setOnSale(incoming.isOnSale());
        vehicle.setAmountInStock(incoming.getAmountInStock());
        vehicle.setInStock(incoming.getAmountInStock() > 0);
        vehicle.setPrice(incoming.getPrice());

        return vehicleRepository.save(vehicle);
    }

    // Partially updates an existing vehicle; only non-null fields from patch are applied.
    @Transactional
    public Vehicle patchVehicle(int vehicleId, PatchVehicleDTO patch) {
        Vehicle vehicle = findVehicleOrThrow(vehicleId);

        if (patch.getBrand() != null) {
            if (patch.getBrand().isBlank()) {
                throw new IllegalArgumentException("Vehicle brand must not be blank");
            }
            vehicle.setBrand(patch.getBrand());
        }
        if (patch.getMake() != null) {
            if (patch.getMake().isBlank()) {
                throw new IllegalArgumentException("Vehicle make must not be blank");
            }
            vehicle.setMake(patch.getMake());
        }
        if (patch.getModel() != null) {
            if (patch.getModel().isBlank()) {
                throw new IllegalArgumentException("Vehicle model must not be blank");
            }
            vehicle.setModel(patch.getModel());
        }
        if (patch.getYear() != null) {
            if (patch.getYear() <= 0) {
                throw new IllegalArgumentException("Vehicle year must be a positive value");
            }
            vehicle.setYear(patch.getYear());
        }
        if (patch.getColor() != null) {
            if (patch.getColor().isBlank()) {
                throw new IllegalArgumentException("Vehicle color must not be blank");
            }
            vehicle.setColor(patch.getColor());
        }
        if (patch.getDoors() != null) {
            vehicle.setDoors(patch.getDoors());
        }
        if (patch.getSeats() != null) {
            vehicle.setSeats(patch.getSeats());
        }
        if (patch.getEmissionScore() != null) {
            vehicle.setEmissionScore(patch.getEmissionScore());
        }
        if (patch.getFuelUsage() != null) {
            vehicle.setFuelUsage(patch.getFuelUsage());
        }
        if (patch.getMileage() != null) {
            vehicle.setMileage(patch.getMileage());
        }
        if (patch.getIsOnSale() != null) {
            vehicle.setOnSale(patch.getIsOnSale());
        }
        if (patch.getAmountInStock() != null) {
            if (patch.getAmountInStock() < 0) {
                throw new IllegalArgumentException("Vehicle amount in stock must not be negative");
            }
            vehicle.setAmountInStock(patch.getAmountInStock());
            vehicle.setInStock(patch.getAmountInStock() > 0);
        } else if (patch.getIsInStock() != null) {
            // Keep amount and inStock consistent when only stock status is patched.
            if (!patch.getIsInStock()) {
                vehicle.setAmountInStock(0);
                vehicle.setInStock(false);
            } else {
                if (vehicle.getAmountInStock() == 0) {
                    vehicle.setAmountInStock(1);
                }
                vehicle.setInStock(true);
            }
        }
        if (patch.getPrice() != null) {
            if (patch.getPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Vehicle price must not be negative");
            }
            vehicle.setPrice(patch.getPrice());
        }

        validateVehicle(vehicle);
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
                predicates.add(cb.greaterThanOrEqualTo(root.get("price").as(BigDecimal.class), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price").as(BigDecimal.class), filter.getMaxPrice()));
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
        if (vehicle.getPrice() == null || vehicle.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Vehicle price must not be negative");
        }
        if (vehicle.getAmountInStock() < 0) {
            throw new IllegalArgumentException("Vehicle amount in stock must not be negative");
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

    // Compares 2–3 vehicles by ID and returns the list along with the recommended vehicle and a reason.
    @Transactional(readOnly = true)
    public CompareResponseDTO compareVehicles(List<Integer> vehicleIds) {
        if (vehicleIds == null || vehicleIds.size() < 2 || vehicleIds.size() > 3) {
            throw new IllegalArgumentException("Please select between 2 and 3 vehicles to compare.");
        }
        List<Vehicle> vehicles = vehicleIds.stream()
                .map(this::findVehicleOrThrow)
                .toList();

        Vehicle recommended = pickBestVehicle(vehicles);
        String reason = buildRecommendationReason(vehicles, recommended);

        List<VehicleResponseDTO> dtos = vehicles.stream().map(this::toResponseDTO).toList();
        return new CompareResponseDTO(dtos, recommended.getVehicleId(), reason);
    }

    // Scores each vehicle across price, mileage, emissions, and fuel usage and picks the highest scorer.
    private Vehicle pickBestVehicle(List<Vehicle> vehicles) {
        double maxPrice    = vehicles.stream().mapToDouble(v -> v.getPrice().doubleValue()).max().orElse(1);
        double minPrice    = vehicles.stream().mapToDouble(v -> v.getPrice().doubleValue()).min().orElse(0);
        double maxMileage  = vehicles.stream().mapToDouble(Vehicle::getMileage).max().orElse(1);
        double minMileage  = vehicles.stream().mapToDouble(Vehicle::getMileage).min().orElse(0);
        double maxEmission = vehicles.stream().mapToDouble(Vehicle::getEmissionScore).max().orElse(1);
        double minEmission = vehicles.stream().mapToDouble(Vehicle::getEmissionScore).min().orElse(0);
        double maxFuel     = vehicles.stream().mapToDouble(Vehicle::getFuelUsage).max().orElse(1);
        double minFuel     = vehicles.stream().mapToDouble(Vehicle::getFuelUsage).min().orElse(0);

        return vehicles.stream()
                .max(Comparator.comparingDouble(v -> {
                    double priceScore    = normalizeScore(v.getPrice().doubleValue(), minPrice, maxPrice, true);
                    double mileageScore  = normalizeScore(v.getMileage(), minMileage, maxMileage, false);
                    double emissionScore = normalizeScore(v.getEmissionScore(), minEmission, maxEmission, true);
                    double fuelScore     = normalizeScore(v.getFuelUsage(), minFuel, maxFuel, true);
                    double total = 0.35 * priceScore + 0.25 * mileageScore + 0.20 * emissionScore + 0.20 * fuelScore;
                    if (v.isInStock()) total += 0.05;
                    if (v.isOnSale())  total += 0.03;
                    return total;
                }))
                .orElse(vehicles.get(0));
    }

    // Returns a score in [0, 1]. lowerIsBetter=true means a lower raw value yields a higher score.
    private double normalizeScore(double value, double min, double max, boolean lowerIsBetter) {
        if (max == min) return 0.5;
        double normalized = (value - min) / (max - min);
        return lowerIsBetter ? (1.0 - normalized) : normalized;
    }

    // Builds a human-readable sentence explaining why the vehicle was recommended.
    private String buildRecommendationReason(List<Vehicle> vehicles, Vehicle recommended) {
        boolean hasLowestPrice = vehicles.stream()
                .filter(v -> v.getVehicleId() != recommended.getVehicleId())
                .allMatch(v -> recommended.getPrice().compareTo(v.getPrice()) <= 0);
        boolean hasLowestEmission = vehicles.stream()
                .filter(v -> v.getVehicleId() != recommended.getVehicleId())
                .allMatch(v -> recommended.getEmissionScore() <= v.getEmissionScore());
        boolean hasBestMileage = vehicles.stream()
                .filter(v -> v.getVehicleId() != recommended.getVehicleId())
                .allMatch(v -> recommended.getMileage() >= v.getMileage());

        if (hasLowestPrice && hasLowestEmission) {
            return "Lowest price and best emission score across all compared vehicles.";
        } else if (hasLowestPrice && hasBestMileage) {
            return "Lowest price and highest mileage range across all compared vehicles.";
        } else if (hasLowestPrice) {
            return "Most affordable option with a strong balance of efficiency and range.";
        } else if (hasLowestEmission) {
            return "Cleanest emission profile, making it the most eco-friendly choice.";
        } else if (hasBestMileage) {
            return "Longest range, ideal for drivers who prioritize distance per charge or tank.";
        }
        return "Best overall value across price, mileage, efficiency, and stock availability.";
    }

    // Maps a Vehicle entity to a VehicleResponseDTO.
    private VehicleResponseDTO toResponseDTO(Vehicle vehicle) {
        return new VehicleResponseDTO(
                vehicle.getVehicleId(),
                vehicle.getBrand(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getColor(),
                vehicle.getDoors(),
                vehicle.getSeats(),
                vehicle.getEmissionScore(),
                vehicle.getFuelUsage(),
                vehicle.getMileage(),
                vehicle.isOnSale(),
                vehicle.isInStock(),
                vehicle.getAmountInStock(),
                vehicle.getPrice()
        );
    }
}

