package com.example.apexauto.services;
import com.example.apexauto.DTO.UpdateOrderDTO;
import com.example.apexauto.entity.CartLine;
import com.example.apexauto.entity.CartStatus;
import com.example.apexauto.entity.Carts;
import com.example.apexauto.entity.OrderLine;
import com.example.apexauto.entity.OrderStatus;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.repository.CartLineRepository;
import com.example.apexauto.repository.CartsRepository;
import com.example.apexauto.repository.CartStatusRepository;
import com.example.apexauto.repository.OrderLineRepository;
import com.example.apexauto.repository.OrderStatusRepository;
import com.example.apexauto.repository.OrdersRepository;
import com.example.apexauto.repository.PaymentRepository;
import com.example.apexauto.repository.UserRepository;
import com.example.apexauto.repository.VehicleRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;

// This service contains order, order status, and order line business logic.
@Service
public class OrderService {

    private static final String DEFAULT_ORDER_STATUS = "PENDING";
    private static final String CHECKED_OUT_CART_STATUS = "CHECKED_OUT";
    private static final BigDecimal TAX_RATE = new BigDecimal("0.13");
    private static final BigDecimal DELIVERY_FEE = new BigDecimal("1250.00");

    private final OrdersRepository ordersRepository;
    private final OrderStatusRepository orderStatusRepository;
    private final OrderLineRepository orderLineRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final PaymentRepository paymentRepository;
    private final CartLineRepository cartLineRepository;
    private final CartsRepository cartsRepository;
    private final CartStatusRepository cartStatusRepository;

    public OrderService(
            OrdersRepository ordersRepository,
            OrderStatusRepository orderStatusRepository,
            OrderLineRepository orderLineRepository,
            UserRepository userRepository,
            VehicleRepository vehicleRepository,
            PaymentRepository paymentRepository,
            CartLineRepository cartLineRepository,
            CartsRepository cartsRepository,
            CartStatusRepository cartStatusRepository
    ) {
        this.ordersRepository = ordersRepository;
        this.orderStatusRepository = orderStatusRepository;
        this.orderLineRepository = orderLineRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.paymentRepository = paymentRepository;
        this.cartLineRepository = cartLineRepository;
        this.cartsRepository = cartsRepository;
        this.cartStatusRepository = cartStatusRepository;
    }


    @Transactional
    public Orders createOrderFromCart(int cartId) {
        Carts cart = validateCartExists(cartId);
        
        // Verify that the logged-in user owns the cart
        User currentUser = getCurrentAuthenticatedUser();
        if (cart.getUser().getUserId() != currentUser.getUserId()) {
            throw new IllegalArgumentException("You do not have permission to check out this cart");
        }
        
        // Check that cart status is ACTIVE before checkout
        if (!cart.getCartStatus().getCartStatusName().equalsIgnoreCase("ACTIVE")) {
            throw new IllegalArgumentException("Cart status must be ACTIVE to create an order");
        }
        
        List<CartLine> cartLines = cartLineRepository.findByCartCartIdOrderByCartLineIdAsc(cartId);

        if (cartLines.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        User user = cart.getUser();
        OrderStatus orderStatus = getOrCreateDefaultOrderStatus();

        Orders order = new Orders();
        order.setUser(user);
        order.setOrderStatus(orderStatus);
        order.setDeliveryDate(null);
        order.setTotalAmount(calculateTotalFromCartLines(cartLines));

        Orders savedOrder = ordersRepository.save(order);
        createOrderLinesFromCartLines(savedOrder, cartLines);
        reduceStockFromCartLines(cartLines);
        
        // Change cart status to CHECKED_OUT
        CartStatus checkedOutStatus = getOrCreateCheckedOutCartStatus();
        cart.setCartStatus(checkedOutStatus);
        cartsRepository.save(cart);

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
        return orderLineRepository.findByOrderOrderIdOrderByOrderLineIdAsc(orderId);
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

        OrderLine orderLine = new OrderLine();
        orderLine.setOrder(order);
        orderLine.setVehicle(vehicle);
        orderLine.setQuantity(1);
        applyCashPricing(orderLine, vehicle);
        orderLineRepository.save(orderLine);

        reduceStock(vehicle, 1);
        order.setTotalAmount(recalculateTotalAmount(order.getOrderId()));

        return ordersRepository.save(order);
    }

    @Transactional
    public Orders removeVehicleFromOrder(int orderId, int orderLineId) {
        Orders order = validateOrderExists(orderId);
        ensureOrderHasNoPayment(orderId);
        List<OrderLine> existingLines = orderLineRepository.findByOrderOrderIdOrderByOrderLineIdAsc(orderId);

        if (existingLines.size() <= 1) {
            throw new IllegalArgumentException("Order must contain at least one vehicle");
        }

        OrderLine orderLine = orderLineRepository.findByOrderOrderIdAndOrderLineId(orderId, orderLineId)
                .orElseThrow(() -> new IllegalArgumentException("Order line not found"));

        restoreStock(orderLine.getVehicle(), orderLine.getQuantity());
        orderLineRepository.delete(orderLine);
        order.setTotalAmount(recalculateTotalAmount(order.getOrderId()));

        return ordersRepository.save(order);
    }

    // Deletes any order. Restricted to admins at the controller/security layer.
    @Transactional
    public void deleteOrder(int orderId) {
        Orders order = validateOrderExists(orderId);
        deleteOrderInternal(order);
    }

    // Deletes an order only if it belongs to the given user.
    @Transactional
    public void deleteOwnOrder(int userId, int orderId) {
        Orders order = validateOrderExists(orderId);

        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser.getUserId() != userId || order.getUser().getUserId() != userId) {
            throw new IllegalArgumentException("You do not have permission to delete this order");
        }

        deleteOrderInternal(order);
    }

    private void deleteOrderInternal(Orders order) {
        if (paymentRepository.existsByOrderOrderId(order.getOrderId())) {
            throw new IllegalArgumentException("Cannot delete order with existing payment");
        }

        List<OrderLine> orderLines = orderLineRepository.findByOrderOrderIdOrderByOrderLineIdAsc(order.getOrderId());
        restoreStockFromOrderLines(orderLines);
        orderLineRepository.deleteAll(orderLines);
        ordersRepository.delete(order);
    }

    private void ensureOrderHasNoPayment(int orderId) {
        if (paymentRepository.existsByOrderOrderId(orderId)) {
            throw new IllegalArgumentException("Cannot change order lines after payment exists");
        }
    }

    private void createOrderLinesFromCartLines(Orders order, List<CartLine> cartLines) {
        for (CartLine cartLine : cartLines) {
            Vehicle vehicle = cartLine.getVehicle();
            OrderLine orderLine = new OrderLine();
            orderLine.setOrder(order);
            orderLine.setVehicle(vehicle);
            orderLine.setQuantity(normalizeQuantity(cartLine.getQuantity()));
            orderLine.setFinancingSelected(cartLine.isFinancingSelected());
            orderLine.setDownPayment(cartLine.getDownPayment());
            orderLine.setAnnualRatePercent(cartLine.getAnnualRatePercent());
            orderLine.setTermMonths(cartLine.getTermMonths());
            orderLine.setMonthlyPayment(cartLine.getMonthlyPayment());
            orderLine.setLineTotalCost(resolveLineTotalCost(cartLine.getLineTotalCost(), vehicle.getPrice()));
            orderLine.setTotalInterest(cartLine.getTotalInterest());
            orderLineRepository.save(orderLine);
        }
    }

    private BigDecimal recalculateTotalAmount(int orderId) {
        List<OrderLine> orderLines = orderLineRepository.findByOrderOrderIdOrderByOrderLineIdAsc(orderId);
        return calculateTotalFromOrderLines(orderLines);
    }

    private BigDecimal calculateTotalFromCartLines(List<CartLine> cartLines) {
        BigDecimal subtotal = cartLines.stream()
                .map(cartLine -> resolveLineTotalCost(
                        cartLine.getLineTotalCost(),
                        cartLine.getVehicle().getPrice()
                ).multiply(BigDecimal.valueOf(normalizeQuantity(cartLine.getQuantity()))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return applyTaxAndDelivery(subtotal);
    }

    private BigDecimal calculateTotalFromOrderLines(List<OrderLine> orderLines) {
        BigDecimal subtotal = orderLines.stream()
                .map(orderLine -> resolveLineTotalCost(
                        orderLine.getLineTotalCost(),
                        orderLine.getVehicle().getPrice()
                ).multiply(BigDecimal.valueOf(normalizeQuantity(orderLine.getQuantity()))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return applyTaxAndDelivery(subtotal);
    }

    // Applies the estimated tax (13%) and flat delivery fee to a subtotal,
    // mirroring the breakdown shown to customers at checkout.
    private BigDecimal applyTaxAndDelivery(BigDecimal subtotal) {
        BigDecimal tax = subtotal.multiply(TAX_RATE);
        return subtotal.add(tax).add(DELIVERY_FEE).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal resolveLineTotalCost(BigDecimal lineTotalCost, BigDecimal vehiclePrice) {
        return lineTotalCost != null ? lineTotalCost : vehiclePrice;
    }

    private void applyCashPricing(OrderLine orderLine, Vehicle vehicle) {
        orderLine.setFinancingSelected(false);
        orderLine.setDownPayment(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        orderLine.setAnnualRatePercent(null);
        orderLine.setTermMonths(null);
        orderLine.setMonthlyPayment(null);
        orderLine.setLineTotalCost(vehicle.getPrice().setScale(2, RoundingMode.HALF_UP));
        orderLine.setTotalInterest(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
    }

    private void reduceStockFromCartLines(List<CartLine> cartLines) {
        for (CartLine cartLine : cartLines) {
            reduceStock(cartLine.getVehicle(), normalizeQuantity(cartLine.getQuantity()));
        }
    }

    private void reduceStock(Vehicle vehicle, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be a positive value");
        }

        if (vehicle.getAmountInStock() < quantity) {
            throw new IllegalArgumentException("Vehicle " + vehicle.getVehicleId() + " has insufficient stock");
        }

        vehicle.setAmountInStock(vehicle.getAmountInStock() - quantity);
        vehicle.setInStock(vehicle.getAmountInStock() > 0);
        vehicleRepository.save(vehicle);
    }

    private void restoreStockFromOrderLines(List<OrderLine> orderLines) {
        for (OrderLine orderLine : orderLines) {
            restoreStock(orderLine.getVehicle(), normalizeQuantity(orderLine.getQuantity()));
        }
    }

    private void restoreStock(Vehicle vehicle, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be a positive value");
        }

        vehicle.setAmountInStock(vehicle.getAmountInStock() + quantity);
        vehicle.setInStock(true);
        vehicleRepository.save(vehicle);
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

    private CartStatus getOrCreateCheckedOutCartStatus() {
        return cartStatusRepository.findByCartStatusNameIgnoreCase(CHECKED_OUT_CART_STATUS)
                .orElseGet(() -> {
                    CartStatus cartStatus = new CartStatus();
                    cartStatus.setCartStatusName(CHECKED_OUT_CART_STATUS);
                    return cartStatusRepository.save(cartStatus);
                });
    }

    private Carts validateCartExists(int cartId) {
        if (cartId <= 0) {
            throw new IllegalArgumentException("Cart ID must be a positive value");
        }

        return cartsRepository.findByCartId(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
    }

    private int normalizeQuantity(int quantity) {
        return quantity <= 0 ? 1 : quantity;
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User is not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            throw new IllegalArgumentException("Invalid authentication principal");
        }
        
        User user = (User) principal;
        return userRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
