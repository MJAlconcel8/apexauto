package com.example.apexauto.services;
import com.example.apexauto.DTO.UpdateOrderDTO;
import com.example.apexauto.DTO.UpdateOrderStatusDTO;
import com.example.apexauto.entity.CartLine;
import com.example.apexauto.entity.Carts;
import com.example.apexauto.entity.OrderLine;
import com.example.apexauto.entity.OrderLineId;
import com.example.apexauto.entity.OrderStatus;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.CartLineRepository;
import com.example.apexauto.repository.CartsRepository;
import com.example.apexauto.repository.OrderLineRepository;
import com.example.apexauto.repository.OrderStatusRepository;
import com.example.apexauto.repository.OrdersRepository;
import com.example.apexauto.repository.PaymentRepository;
import com.example.apexauto.repository.UserRepository;
import com.example.apexauto.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

// This service contains order, order status, and order line business logic.
@Service
public class OrderService {

    private static final String DEFAULT_ORDER_STATUS = "PENDING";

    private final OrdersRepository ordersRepository;
    private final OrderStatusRepository orderStatusRepository;
    private final OrderLineRepository orderLineRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final PaymentRepository paymentRepository;
    private final CartLineRepository cartLineRepository;
    private final CartsRepository cartsRepository;

    public OrderService(
            OrdersRepository ordersRepository,
            OrderStatusRepository orderStatusRepository,
            OrderLineRepository orderLineRepository,
            UserRepository userRepository,
            VehicleRepository vehicleRepository,
            PaymentRepository paymentRepository,
            CartLineRepository cartLineRepository,
            CartsRepository cartsRepository
    ) {
        this.ordersRepository = ordersRepository;
        this.orderStatusRepository = orderStatusRepository;
        this.orderLineRepository = orderLineRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.paymentRepository = paymentRepository;
        this.cartLineRepository = cartLineRepository;
        this.cartsRepository = cartsRepository;
    }


    @Transactional
    public Orders createOrderFromCart(int cartId) {
        Carts cart = validateCartExists(cartId);
        List<CartLine> cartLines = cartLineRepository.findByCartCartIdOrderByVehicleVehicleIdAsc(cartId);

        if (cartLines.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        List<Vehicle> vehicles = cartLines.stream()
                .map(CartLine::getVehicle)
                .toList();

        User user = cart.getUser();
        OrderStatus orderStatus = getOrCreateDefaultOrderStatus();

        Orders order = new Orders();
        order.setUser(user);
        order.setOrderStatus(orderStatus);
        order.setDeliveryDate(null);
        order.setTotalAmount(calculateTotal(vehicles));

        Orders savedOrder = ordersRepository.save(order);
        createOrderLines(savedOrder, vehicles);
        reduceStock(vehicles);

        return ordersRepository.save(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<Orders> getAllOrders() {
        return ordersRepository.findAllByOrderByOrderIdDesc();
    }

    @Transactional(readOnly = true)
    public List<Orders> getOrdersByUserId(int userId) {
        validateUserExists(userId);
        return ordersRepository.findByUserUserIdOrderByOrderIdDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Orders> getOrdersByOrderStatusId(int orderStatusId) {
        validateOrderStatusExists(orderStatusId);
        return ordersRepository.findByOrderStatusOrderStatusIdOrderByOrderIdDesc(orderStatusId);
    }

    @Transactional(readOnly = true)
    public Orders getOrderById(int orderId) {
        return validateOrderExists(orderId);
    }

    @Transactional(readOnly = true)
    public List<OrderLine> getOrderLines(int orderId) {
        validateOrderExists(orderId);
        return orderLineRepository.findByOrderOrderIdOrderByVehicleVehicleIdAsc(orderId);
    }

    @Transactional
    public Orders updateOrder(int orderId, UpdateOrderDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Order update request must not be null");
        }

        Orders order = validateOrderExists(orderId);

        if (request.getOrderStatusId() != null) {
            order.setOrderStatus(validateOrderStatusExists(request.getOrderStatusId()));
        }

        if (request.getDeliveryDate() != null) {
            order.setDeliveryDate(request.getDeliveryDate());
        }

        return ordersRepository.save(order);
    }

    @Transactional
    public Orders updateOrderStatus(int orderId, int orderStatusId) {
        Orders order = validateOrderExists(orderId);
        order.setOrderStatus(validateOrderStatusExists(orderStatusId));
        return ordersRepository.save(order);
    }

    @Transactional
    public Orders addVehicleToOrder(int orderId, int vehicleId) {
        Orders order = validateOrderExists(orderId);
        ensureOrderHasNoPayment(orderId);
        Vehicle vehicle = validateVehicleForOrderLine(vehicleId);

        if (orderLineRepository.existsByOrderOrderIdAndVehicleVehicleId(orderId, vehicleId)) {
            throw new IllegalArgumentException("Vehicle already exists in this order");
        }

        OrderLine orderLine = new OrderLine();
        orderLine.setId(new OrderLineId(order.getOrderId(), vehicle.getVehicleId()));
        orderLine.setOrder(order);
        orderLine.setVehicle(vehicle);
        orderLineRepository.save(orderLine);

        reduceStock(List.of(vehicle));
        order.setTotalAmount(recalculateTotalAmount(order.getOrderId()));

        return ordersRepository.save(order);
    }

    @Transactional
    public Orders removeVehicleFromOrder(int orderId, int vehicleId) {
        Orders order = validateOrderExists(orderId);
        ensureOrderHasNoPayment(orderId);
        List<OrderLine> existingLines = orderLineRepository.findByOrderOrderIdOrderByVehicleVehicleIdAsc(orderId);

        if (existingLines.size() <= 1) {
            throw new IllegalArgumentException("Order must contain at least one vehicle");
        }

        OrderLine orderLine = orderLineRepository.findByOrderOrderIdAndVehicleVehicleId(orderId, vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Order line not found"));

        restoreStock(List.of(orderLine.getVehicle()));
        orderLineRepository.delete(orderLine);
        order.setTotalAmount(recalculateTotalAmount(order.getOrderId()));

        return ordersRepository.save(order);
    }

    @Transactional
    public void deleteOrder(int orderId) {
        Orders order = validateOrderExists(orderId);

        if (paymentRepository.existsByOrderOrderId(orderId)) {
            throw new IllegalArgumentException("Cannot delete order with existing payment");
        }

        List<OrderLine> orderLines = orderLineRepository.findByOrderOrderIdOrderByVehicleVehicleIdAsc(orderId);
        restoreStock(orderLines.stream().map(OrderLine::getVehicle).toList());
        orderLineRepository.deleteAll(orderLines);
        ordersRepository.delete(order);
    }

    private void ensureOrderHasNoPayment(int orderId) {
        if (paymentRepository.existsByOrderOrderId(orderId)) {
            throw new IllegalArgumentException("Cannot change order lines after payment exists");
        }
    }

    private void createOrderLines(Orders order, List<Vehicle> vehicles) {
        for (Vehicle vehicle : vehicles) {
            OrderLine orderLine = new OrderLine();
            orderLine.setId(new OrderLineId(order.getOrderId(), vehicle.getVehicleId()));
            orderLine.setOrder(order);
            orderLine.setVehicle(vehicle);
            orderLineRepository.save(orderLine);
        }
    }

    private BigDecimal recalculateTotalAmount(int orderId) {
        List<OrderLine> orderLines = orderLineRepository.findByOrderOrderIdOrderByVehicleVehicleIdAsc(orderId);
        return calculateTotal(orderLines.stream().map(OrderLine::getVehicle).toList());
    }

    private BigDecimal calculateTotal(List<Vehicle> vehicles) {
        return vehicles.stream()
                .map(Vehicle::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void reduceStock(List<Vehicle> vehicles) {
        for (Vehicle vehicle : vehicles) {
            vehicle.setAmountInStock(vehicle.getAmountInStock() - 1);
            vehicle.setInStock(vehicle.getAmountInStock() > 0);
            vehicleRepository.save(vehicle);
        }
    }

    private void restoreStock(List<Vehicle> vehicles) {
        for (Vehicle vehicle : vehicles) {
            vehicle.setAmountInStock(vehicle.getAmountInStock() + 1);
            vehicle.setInStock(true);
            vehicleRepository.save(vehicle);
        }
    }


    private Vehicle validateVehicleForOrderLine(int vehicleId) {
        Vehicle vehicle = validateVehicleExists(vehicleId);

        if (!vehicle.isInStock() || vehicle.getAmountInStock() <= 0) {
            throw new IllegalArgumentException("Vehicle is not in stock");
        }

        if (vehicle.getPrice() == null || vehicle.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Vehicle price must not be negative");
        }

        return vehicle;
    }

    private Vehicle validateVehicleExists(int vehicleId) {
        if (vehicleId <= 0) {
            throw new IllegalArgumentException("Vehicle ID must be a positive value");
        }

        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
    }

    private Orders validateOrderExists(int orderId) {
        if (orderId <= 0) {
            throw new IllegalArgumentException("Order ID must be a positive value");
        }

        return ordersRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }

    private User validateUserExists(int userId) {
        if (userId <= 0) {
            throw new IllegalArgumentException("User ID must be a positive value");
        }

        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private OrderStatus validateOrderStatusExists(int orderStatusId) {
        if (orderStatusId <= 0) {
            throw new IllegalArgumentException("Order status ID must be a positive value");
        }

        return orderStatusRepository.findByOrderStatusId(orderStatusId)
                .orElseThrow(() -> new IllegalArgumentException("Order status not found"));
    }

    private OrderStatus getOrCreateDefaultOrderStatus() {
        return orderStatusRepository.findByOrderStatusNameIgnoreCase(DEFAULT_ORDER_STATUS)
                .orElseGet(() -> {
                    OrderStatus orderStatus = new OrderStatus();
                    orderStatus.setOrderStatusName(DEFAULT_ORDER_STATUS.toUpperCase(Locale.ROOT));
                    return orderStatusRepository.save(orderStatus);
                });
    }

    private Carts validateCartExists(int cartId) {
        if (cartId <= 0) {
            throw new IllegalArgumentException("Cart ID must be a positive value");
        }

        return cartsRepository.findByCartId(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
    }
}
