package com.example.apexauto.controller;

import com.example.apexauto.DTO.VehicleHistoryResponseDTO;
import com.example.apexauto.entity.VehicleHistory;
import com.example.apexauto.services.VehicleHistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/vehicle-history")
public class GlobalVehicleHistoryController {

    private final VehicleHistoryService vehicleHistoryService;

    public GlobalVehicleHistoryController(VehicleHistoryService vehicleHistoryService) {
        this.vehicleHistoryService = vehicleHistoryService;
    }

    // GET /vehicle-history — returns all vehicle history entries (newest first)
    @GetMapping
    public ResponseEntity<List<VehicleHistoryResponseDTO>> getAllVehicleHistoryEntries() {
        try {
            List<VehicleHistoryResponseDTO> entries = vehicleHistoryService.getVehicleHistoryEntriesForAllVehicles()
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(entries);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /vehicle-history/vehicles/{vehicleId} — returns all vehicle history entries for one vehicle (newest first)
    @GetMapping("/vehicles/{vehicleId}")
    public ResponseEntity<List<VehicleHistoryResponseDTO>> getVehicleHistoryEntriesByVehicleId(@PathVariable int vehicleId) {
        try {
            List<VehicleHistoryResponseDTO> entries = vehicleHistoryService.getVehicleHistoryEntriesByVehicleId(vehicleId)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(entries);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /vehicle-history — deletes all vehicle history entries from the database
    @DeleteMapping
    public ResponseEntity<Void> deleteAllVehicleHistoryEntriesForAllVehicles() {
        try {
            vehicleHistoryService.deleteAllVehicleHistoryEntriesForAllVehicles();
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /vehicle-history/vehicles/{vehicleId} — deletes all vehicle history entries for a specific vehicle
    @DeleteMapping("/vehicles/{vehicleId}")
    public ResponseEntity<Void> deleteAllVehicleHistoryEntriesByVehicleId(@PathVariable int vehicleId) {
        try {
            vehicleHistoryService.deleteAllVehicleHistoryEntriesByVehicleId(vehicleId);
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

