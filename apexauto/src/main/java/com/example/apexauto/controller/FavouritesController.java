package com.example.apexauto.controller;

import com.example.apexauto.DTO.CreateFavouritesDTO;
import com.example.apexauto.DTO.FavouritesResponseDTO;
import com.example.apexauto.entity.Favourites;
import com.example.apexauto.services.FavouritesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/users/{userId}/favourites")
public class FavouritesController {

    private final FavouritesService favouritesService;

    public FavouritesController(FavouritesService favouritesService) {
        this.favouritesService = favouritesService;
    }

    // GET /users/{userId}/favourites - returns all favourites for a user (newest first)
    @GetMapping
    public ResponseEntity<List<FavouritesResponseDTO>> getFavouritesByUserId(@PathVariable int userId) {
        try {
            List<FavouritesResponseDTO> favourites = favouritesService.getFavouritesByUserId(userId)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
            return ResponseEntity.ok(favourites);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /users/{userId}/favourites/{vehicleId} - returns a specific favourite for a user
    @GetMapping("/{vehicleId}")
    public ResponseEntity<FavouritesResponseDTO> getFavouriteByUserIdAndVehicleId(
            @PathVariable int userId,
            @PathVariable int vehicleId
    ) {
        try {
            Favourites favourite = favouritesService.getFavouriteByUserIdAndVehicleId(userId, vehicleId);
            return ResponseEntity.ok(toResponseDTO(favourite));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /users/{userId}/favourites - adds a vehicle to a user's favourites
    @PostMapping
    public ResponseEntity<FavouritesResponseDTO> addFavourite(
            @PathVariable int userId,
            @RequestBody CreateFavouritesDTO request
    ) {
        try {
            if (request.getUserId() != 0 && request.getUserId() != userId) {
                throw new IllegalArgumentException("Path userId does not match request body userId");
            }

            Favourites saved = favouritesService.addFavourite(userId, request.getVehicleId());
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /users/{userId}/favourites/{vehicleId} - removes a vehicle from a user's favourites
    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> removeFavourite(
            @PathVariable int userId,
            @PathVariable int vehicleId
    ) {
        try {
            favouritesService.removeFavourite(userId, vehicleId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private FavouritesResponseDTO toResponseDTO(Favourites favourite) {
        return new FavouritesResponseDTO(
                favourite.getFavouriteId(),
                favourite.getUser().getUserId(),
                favourite.getVehicle().getVehicleId()
        );
    }

    private ResponseStatusException toHttpException(IllegalArgumentException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}

