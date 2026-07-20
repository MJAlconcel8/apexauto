package com.example.apexauto.controller;

import com.example.apexauto.DTO.CreateVehicleHistoryDTO;
import com.example.apexauto.DTO.VehicleHistoryResponseDTO;
import com.example.apexauto.entity.VehicleHistory;
import com.example.apexauto.services.VehicleHistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/users/{userId}/vehicle-history")
public class VehicleHistoryController {

    private final VehicleHistoryService vehicleHistoryService;

    public VehicleHistoryController(VehicleHistoryService vehicleHistoryService) {
        this.vehicleHistoryService = vehicleHistoryService;
    }

    // GET /users/{userId}/vehicle-history — returns all vehicle history entries for a user (newest first)
    @GetMapping
    public ResponseEntity<List<VehicleHistoryResponseDTO>> getVehicleHistoryEntriesByUserId(@PathVariable int userId) {
        try {
            List<VehicleHistoryResponseDTO> entries = vehicleHistoryService.getVehicleHistoryEntriesByUserId(userId)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(entries);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /users/{userId}/vehicle-history/{vehicleHistoryId} — returns a specific vehicle history entry for a user
    @GetMapping("/{vehicleHistoryId}")
    public ResponseEntity<VehicleHistoryResponseDTO> getVehicleHistoryEntryByIdForUser(
            @PathVariable int userId,
            @PathVariable int vehicleHistoryId
    ) {
        try {
            VehicleHistory vehicleHistory = vehicleHistoryService.getVehicleHistoryEntryByIdForUser(userId, vehicleHistoryId);
            return ResponseEntity.ok(toResponseDTO(vehicleHistory));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }



    // POST /users/{userId}/vehicle-history — creates a new vehicle history entry for a user
    @PostMapping
    public ResponseEntity<VehicleHistoryResponseDTO> createVehicleHistoryEntryForUser(
            @PathVariable int userId,
            @RequestBody CreateVehicleHistoryDTO request
    ) {
        try {
            VehicleHistory saved = vehicleHistoryService.createVehicleHistoryEntryByUser(
                    userId,
                    request.getVehicleId(),
                    request.getVehicleHistoryComments()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /users/{userId}/vehicle-history/{vehicleHistoryId} — deletes one vehicle history entry for a user
    @DeleteMapping("/{vehicleHistoryId}")
    public ResponseEntity<Void> deleteVehicleHistoryEntryByIdForUser(
            @PathVariable int userId,
            @PathVariable int vehicleHistoryId
    ) {
        try {
            vehicleHistoryService.deleteVehicleHistoryEntryByIdForUser(userId, vehicleHistoryId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /users/{userId}/vehicle-history — deletes all vehicle history entries for a user
    @DeleteMapping
    public ResponseEntity<Void> deleteAllVehicleHistoryEntriesByUserId(@PathVariable int userId) {
        try {
            vehicleHistoryService.deleteAllVehicleHistoryEntriesByUserId(userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /vehicles/{vehicleId}/history — deletes all vehicle history entries for a specific vehicle
    @DeleteMapping("/vehicles/{vehicleId}/history")
    public ResponseEntity<Void> deleteAllVehicleHistoryEntriesByVehicleId(@PathVariable int vehicleId) {
        try {
            vehicleHistoryService.deleteAllVehicleHistoryEntriesByVehicleId(vehicleId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /vehicles/history/all — deletes all vehicle history entries from the database
    @DeleteMapping("/vehicles/history/all")
    public ResponseEntity<Void> deleteAllVehicleHistoryEntriesForAllVehicles() {
        try {
            vehicleHistoryService.deleteAllVehicleHistoryEntriesForAllVehicles();
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private VehicleHistoryResponseDTO toResponseDTO(VehicleHistory vehicleHistory) {
        return new VehicleHistoryResponseDTO(
                vehicleHistory.getVehicleHistoryId(),
                vehicleHistory.getUser().getUserId(),
                vehicleHistory.getVehicle().getVehicleId(),
                vehicleHistory.getVehicleHistoryComments(),
                vehicleHistory.getCreatedAt()
        );
    }

    private ResponseStatusException toHttpException(IllegalArgumentException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}
