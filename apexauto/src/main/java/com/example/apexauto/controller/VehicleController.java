package com.example.apexauto.controller;

import com.example.apexauto.DTO.CompareRequestDTO;
import com.example.apexauto.DTO.CompareResponseDTO;
import com.example.apexauto.DTO.CreateVehicleDTO;
import com.example.apexauto.DTO.PatchVehicleDTO;
import com.example.apexauto.DTO.VehicleFilterDTO;
import com.example.apexauto.DTO.VehicleResponseDTO;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.services.VehicleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    // GET /vehicles — returns all vehicles
    @GetMapping
    public ResponseEntity<List<VehicleResponseDTO>> getAllVehicles() {
        List<VehicleResponseDTO> vehicles = vehicleService.getAllVehicles()
                .stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(vehicles);
    }

    // GET /vehicles/{vehicleId} — returns a single vehicle by ID
    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponseDTO> getVehicleById(@PathVariable int vehicleId) {
        try {
            Vehicle vehicle = vehicleService.getVehicleById(vehicleId);
            return ResponseEntity.ok(toResponseDTO(vehicle));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /vehicles — creates a new vehicle
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VehicleResponseDTO> createVehicle(@RequestBody CreateVehicleDTO dto) {
        try {
            Vehicle vehicle = vehicleService.createVehicle(toEntity(dto));
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(vehicle));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // PUT /vehicles/{vehicleId} — updates an existing vehicle
    @PutMapping("/{vehicleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(
            @PathVariable int vehicleId,
            @RequestBody CreateVehicleDTO dto
    ) {
        try {
            Vehicle vehicle = vehicleService.updateVehicle(vehicleId, toEntity(dto));
            return ResponseEntity.ok(toResponseDTO(vehicle));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // PATCH /vehicles/{vehicleId} — partially updates an existing vehicle
    @PatchMapping("/{vehicleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VehicleResponseDTO> patchVehicle(
            @PathVariable int vehicleId,
            @RequestBody PatchVehicleDTO dto
    ) {
        try {
            Vehicle vehicle = vehicleService.patchVehicle(vehicleId, dto);
            return ResponseEntity.ok(toResponseDTO(vehicle));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /vehicles/{vehicleId} — deletes a vehicle
    @DeleteMapping("/{vehicleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteVehicle(@PathVariable int vehicleId) {
        try {
            vehicleService.deleteVehicle(vehicleId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /vehicles/filter — returns vehicles matching the given filter criteria
    @GetMapping("/filter")
    public ResponseEntity<List<VehicleResponseDTO>> filterVehicles(
            @ModelAttribute VehicleFilterDTO filter
    ) {
        try {
            List<VehicleResponseDTO> vehicles = vehicleService.filterVehicles(filter)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(vehicles);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /vehicles/compare — compares 2–3 vehicles and returns the best recommendation
    @PostMapping("/compare")
    public ResponseEntity<CompareResponseDTO> compareVehicles(@RequestBody CompareRequestDTO dto) {
        try {
            return ResponseEntity.ok(vehicleService.compareVehicles(dto.getVehicleIds()));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
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

    // Maps a CreateVehicleDTO to a new Vehicle entity (vehicleId set to 0 for auto-generation).
    private Vehicle toEntity(CreateVehicleDTO dto) {
        int amountInStock = dto.getAmountInStock() != null
                ? dto.getAmountInStock()
                : (dto.isInStock() ? 1 : 0);

        return new Vehicle(
                0,
                dto.getBrand(),
                dto.getMake(),
                dto.getModel(),
                dto.getYear(),
                dto.getColor(),
                dto.getDoors(),
                dto.getSeats(),
                dto.getEmissionScore(),
                dto.getFuelUsage(),
                dto.getMileage(),
                dto.isOnSale(),
                amountInStock > 0,
                amountInStock,
                dto.getPrice()
        );
    }

    // Converts an IllegalArgumentException to an appropriate HTTP ResponseStatusException.
    private ResponseStatusException toHttpException(IllegalArgumentException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}

