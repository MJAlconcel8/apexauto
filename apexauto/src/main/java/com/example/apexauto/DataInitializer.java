package com.example.apexauto;

import com.example.apexauto.DTO.CreateVehicleDTO;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.VehicleRepository;
import com.example.apexauto.services.VehicleService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

// Seeds the vehicles table with the 3 default Apex Auto listings on every fresh database.
// Runs on startup; skips seeding if any vehicles already exist.
@Component
public class DataInitializer implements CommandLineRunner {

    private final VehicleRepository vehicleRepository;
    private final VehicleService vehicleService;

    public DataInitializer(VehicleRepository vehicleRepository, VehicleService vehicleService) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleService = vehicleService;
    }

    @Override
    public void run(String... args) {
        if (vehicleRepository.count() > 0) return;

        List<CreateVehicleDTO> defaults = List.of(
            // id '1' in the frontend (TOP_PICKS[0]) — Apex Nexus S
            dto("Apex", "Apex", "Nexus S", 2026, "Pearl White", 4, 5, 85.0, 6.2, 459.0, false, 3, new BigDecimal("89900.00")),
            // id '2' in the frontend (TOP_PICKS[1]) — Apex Vector GT
            dto("Apex", "Apex", "Vector GT", 2026, "Alpine White", 2, 4, 165.0, 9.8, 340.0, false, 2, new BigDecimal("134500.00")),
            // id '3' in the frontend (TOP_PICKS[2]) — Apex Terrain X
            dto("Apex", "Apex", "Terrain X", 2026, "Shadow Black", 4, 7, 130.0, 8.4, 370.0, false, 5, new BigDecimal("74900.00")),
            // Landing page listings
            dto("Aster", "Aster", "Kestrel EV Sport", 2024, "Voltage Blue", 4, 5, 77.0, 4.6, 402.0, false, 4, new BigDecimal("58900.00")),
            dto("Halcyon", "Halcyon", "Volen Lumen", 2024, "Pearl White", 4, 5, 90.0, 3.9, 512.0, false, 2, new BigDecimal("74500.00")),
            dto("Meridian", "Meridian", "Meridian Bolt", 2023, "Graphite", 4, 5, 64.0, 5.4, 389.0, true, 9, new BigDecimal("44900.00"))
        );

        for (CreateVehicleDTO d : defaults) {
            vehicleService.createVehicle(toEntity(d));
        }
    }

    private static CreateVehicleDTO dto(
            String brand, String make, String model, int year, String color,
            int doors, int seats, double emissionScore, double fuelUsage,
            double mileage, boolean isOnSale, int amountInStock, BigDecimal price) {
        CreateVehicleDTO d = new CreateVehicleDTO();
        d.setBrand(brand);
        d.setMake(make);
        d.setModel(model);
        d.setYear(year);
        d.setColor(color);
        d.setDoors(doors);
        d.setSeats(seats);
        d.setEmissionScore(emissionScore);
        d.setFuelUsage(fuelUsage);
        d.setMileage(mileage);
        d.setOnSale(isOnSale);
        d.setInStock(amountInStock > 0);
        d.setAmountInStock(amountInStock);
        d.setPrice(price);
        return d;
    }

    private static Vehicle toEntity(CreateVehicleDTO dto) {
        int amountInStock = dto.getAmountInStock() != null
                ? dto.getAmountInStock()
                : (dto.isInStock() ? 1 : 0);
        return new Vehicle(0,
                dto.getBrand(), dto.getMake(), dto.getModel(), dto.getYear(),
                dto.getColor(), dto.getDoors(), dto.getSeats(),
                dto.getEmissionScore(), dto.getFuelUsage(), dto.getMileage(),
                dto.isOnSale(), amountInStock > 0, amountInStock, dto.getPrice());
    }
}
