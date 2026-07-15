package com.example.apexauto.controller;

import com.example.apexauto.DTO.CartLineResponseDTO;
import com.example.apexauto.DTO.CartResponseDTO;
import com.example.apexauto.DTO.CreateCartDTO;
import com.example.apexauto.DTO.OrderLineResponseDTO;
import com.example.apexauto.DTO.OrderResponseDTO;
import com.example.apexauto.DTO.UpdateCartDTO;
import com.example.apexauto.entity.CartLine;
import com.example.apexauto.entity.Carts;
import com.example.apexauto.entity.OrderLine;
import com.example.apexauto.entity.Orders;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.services.CartService;
import com.example.apexauto.services.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/carts")
public class CartController {

    private final CartService cartService;
    private final OrderService orderService;

    public CartController(CartService cartService, OrderService orderService) {
        this.cartService = cartService;
        this.orderService = orderService;
    }

    // GET /carts - returns all carts, newest first.
    @GetMapping
    public ResponseEntity<List<CartResponseDTO>> getAllCarts() {
        try {
            List<CartResponseDTO> carts = cartService.getAllCarts()
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();

            return ResponseEntity.ok(carts);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /carts/status/{cartStatusId} - returns all carts with a specific status.
    @GetMapping("/status/{cartStatusId}")
    public ResponseEntity<List<CartResponseDTO>> getCartsByStatus(@PathVariable int cartStatusId) {
        try {
            List<CartResponseDTO> carts = cartService.getCartsByCartStatusId(cartStatusId)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();

            return ResponseEntity.ok(carts);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /carts/{cartId} - returns one cart.
    @GetMapping("/{cartId}")
    public ResponseEntity<CartResponseDTO> getCartById(@PathVariable int cartId) {
        try {
            Carts cart = cartService.getCartById(cartId);
            return ResponseEntity.ok(toResponseDTO(cart));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /carts - creates a cart and optional cart lines.
    @PostMapping
    public ResponseEntity<CartResponseDTO> createCart(@RequestBody CreateCartDTO request) {
        try {
            Carts saved = cartService.createCart(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // PUT /carts/{cartId} - updates editable cart fields, currently cart status.
    @PutMapping("/{cartId}")
    public ResponseEntity<CartResponseDTO> updateCart(
            @PathVariable int cartId,
            @RequestBody UpdateCartDTO request
    ) {
        try {
            Carts updated = cartService.updateCart(cartId, request);
            return ResponseEntity.ok(toResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /carts/{cartId} - deletes a cart and its cart lines.
    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> deleteCart(@PathVariable int cartId) {
        try {
            cartService.deleteCart(cartId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /carts/{cartId}/checkout - creates an order from the cart.
    @PostMapping("/{cartId}/checkout")
    public ResponseEntity<OrderResponseDTO> checkoutCart(@PathVariable int cartId) {
        try {
            Orders savedOrder = orderService.createOrderFromCart(cartId);
            return ResponseEntity.status(HttpStatus.CREATED).body(toOrderResponseDTO(savedOrder));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private CartResponseDTO toResponseDTO(Carts cart) {
        List<CartLineResponseDTO> cartLines = cartService.getCartLines(cart.getCartId())
                .stream()
                .map(this::toCartLineResponseDTO)
                .toList();

        return new CartResponseDTO(
                cart.getCartId(),
                cart.getUser().getUserId(),
                cart.getCartStatus().getCartStatusId(),
                cart.getCartStatus().getCartStatusName(),
                cart.getTotalItemsInCart(),
                cartLines
        );
    }

    private CartLineResponseDTO toCartLineResponseDTO(CartLine cartLine) {
        Vehicle vehicle = cartLine.getVehicle();

        return new CartLineResponseDTO(
                cartLine.getCart().getCartId(),
                vehicle.getVehicleId(),
                vehicle.getBrand(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getPrice(),
                cartLine.getQuantity(),
                cartLine.isFinancingSelected(),
                cartLine.getDownPayment(),
                cartLine.getAnnualRatePercent(),
                cartLine.getTermMonths(),
                cartLine.getMonthlyPayment(),
                cartLine.getLineTotalCost(),
                cartLine.getTotalInterest()
        );
    }

    private OrderResponseDTO toOrderResponseDTO(Orders order) {
        List<OrderLineResponseDTO> orderLines = orderService.getOrderLines(order.getOrderId())
                .stream()
                .map(this::toOrderLineResponseDTO)
                .toList();

        return new OrderResponseDTO(
                order.getOrderId(),
                order.getUser().getUserId(),
                order.getOrderStatus().getOrderStatusId(),
                order.getOrderStatus().getOrderStatusName(),
                order.getTotalAmount(),
                order.getDeliveryDate(),
                orderLines
        );
    }

    private OrderLineResponseDTO toOrderLineResponseDTO(OrderLine orderLine) {
        Vehicle vehicle = orderLine.getVehicle();
        return new OrderLineResponseDTO(
                orderLine.getOrder().getOrderId(),
                vehicle.getVehicleId(),
                vehicle.getBrand(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getPrice(),
                orderLine.getQuantity(),
                orderLine.isFinancingSelected(),
                orderLine.getDownPayment(),
                orderLine.getAnnualRatePercent(),
                orderLine.getTermMonths(),
                orderLine.getMonthlyPayment(),
                orderLine.getLineTotalCost(),
                orderLine.getTotalInterest()
        );
    }

    private ResponseStatusException toHttpException(IllegalArgumentException ex) {
        String message = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();

        HttpStatus status = message.contains("not found")
                ? HttpStatus.NOT_FOUND
                : message.contains("already exists") || message.contains("duplicate")
                ? HttpStatus.CONFLICT
                : HttpStatus.BAD_REQUEST;

        return new ResponseStatusException(status, ex.getMessage(), ex);
    }
}