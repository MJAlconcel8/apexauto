package com.example.apexauto.services;

import com.example.apexauto.entity.Favourites;
import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.FavouritesRepository;
import com.example.apexauto.repository.UserRepository;
import com.example.apexauto.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FavouritesServiceTest {

    @Mock
    private FavouritesRepository favouritesRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    private FavouritesService favouritesService;
    private User user;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        favouritesService = new FavouritesService(favouritesRepository, vehicleRepository, userRepository);
        user = new User();
        user.setUserId(4);
        vehicle = new Vehicle();
        vehicle.setVehicleId(11);
    }

    @Test
    void addFavourite_savesUserAndVehicle() {
        when(userRepository.findByUserId(4)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(11)).thenReturn(Optional.of(vehicle));
        when(favouritesRepository.existsByUserUserIdAndVehicleVehicleId(4, 11)).thenReturn(false);
        when(favouritesRepository.save(any(Favourites.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Favourites saved = favouritesService.addFavourite(4, 11);

        assertEquals(user, saved.getUser());
        assertEquals(vehicle, saved.getVehicle());
    }

    @Test
    void addFavourite_rejectsDuplicateVehicle() {
        when(userRepository.findByUserId(4)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(11)).thenReturn(Optional.of(vehicle));
        when(favouritesRepository.existsByUserUserIdAndVehicleVehicleId(4, 11)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> favouritesService.addFavourite(4, 11)
        );

        assertEquals("Vehicle already exists in favourites", exception.getMessage());
    }

    @Test
    void removeFavourite_deletesMatchingEntry() {
        Favourites favourite = new Favourites();
        favourite.setUser(user);
        favourite.setVehicle(vehicle);

        when(userRepository.findByUserId(4)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(11)).thenReturn(Optional.of(vehicle));
        when(favouritesRepository.findByUserUserIdAndVehicleVehicleId(4, 11)).thenReturn(Optional.of(favourite));

        favouritesService.removeFavourite(4, 11);

        verify(favouritesRepository).delete(favourite);
    }
}
