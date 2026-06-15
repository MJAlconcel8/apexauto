package com.example.apexauto.controller;

import com.example.apexauto.DTO.CreateVehicleDTO;
import com.example.apexauto.DTO.VehicleFilterDTO;
import com.example.apexauto.DTO.VehicleResponseDTO;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.services.VehicleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    // DELETE /vehicles/{vehicleId} — deletes a vehicle
    @DeleteMapping("/{vehicleId}")
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
                vehicle.getMillage(),
                vehicle.isOnSale(),
                vehicle.isInStock(),
                vehicle.getPrice()
        );
    }

    // Maps a CreateVehicleDTO to a new Vehicle entity (vehicleId set to 0 for auto-generation).
    private Vehicle toEntity(CreateVehicleDTO dto) {
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
                dto.getMillage(),
                dto.isOnSale(),
                dto.isInStock(),
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

