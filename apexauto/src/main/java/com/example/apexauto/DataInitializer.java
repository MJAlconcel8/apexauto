package com.example.apexauto;

import com.example.apexauto.DTO.CreateVehicleDTO;
import com.example.apexauto.entity.CartStatus;
import com.example.apexauto.entity.OrderStatus;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.CartStatusRepository;
import com.example.apexauto.repository.OrderStatusRepository;
import com.example.apexauto.repository.VehicleRepository;
import com.example.apexauto.services.VehicleService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

// Seeds lookup/reference tables on every fresh database.
// Runs on startup; each section skips seeding if its table already has rows.
@Component
public class DataInitializer implements CommandLineRunner {

    private static final List<String> DEFAULT_ORDER_STATUSES = List.of(
            "PENDING", "SHIPPED", "DELIVERED", "CANCELLED"
    );
    private static final List<String> DEFAULT_CART_STATUSES = List.of(
            "ACTIVE", "CHECKED_OUT", "ABANDONED"
    );

    private final VehicleRepository vehicleRepository;
    private final VehicleService vehicleService;
    private final OrderStatusRepository orderStatusRepository;
    private final CartStatusRepository cartStatusRepository;

    public DataInitializer(
            VehicleRepository vehicleRepository,
            VehicleService vehicleService,
            OrderStatusRepository orderStatusRepository,
            CartStatusRepository cartStatusRepository
    ) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleService = vehicleService;
        this.orderStatusRepository = orderStatusRepository;
        this.cartStatusRepository = cartStatusRepository;
    }

    @Override
    public void run(String... args) {
        seedOrderStatuses();
        seedCartStatuses();
        seedVehicles();
    }

    private void seedOrderStatuses() {
        if (orderStatusRepository.count() > 0) return;

        for (String name : DEFAULT_ORDER_STATUSES) {
            OrderStatus orderStatus = new OrderStatus();
            orderStatus.setOrderStatusName(name);
            orderStatusRepository.save(orderStatus);
        }
    }

    private void seedCartStatuses() {
        if (cartStatusRepository.count() > 0) return;

        for (String name : DEFAULT_CART_STATUSES) {
            CartStatus cartStatus = new CartStatus();
            cartStatus.setCartStatusName(name);
            cartStatusRepository.save(cartStatus);
        }
    }

    private void seedVehicles() {
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
