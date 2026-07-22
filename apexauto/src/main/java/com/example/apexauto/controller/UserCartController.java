package com.example.apexauto.controller;

import com.example.apexauto.DTO.CartLineResponseDTO;
import com.example.apexauto.DTO.CartResponseDTO;
import com.example.apexauto.DTO.CreateCartDTO;
import com.example.apexauto.entity.CartLine;
import com.example.apexauto.entity.Carts;
import com.example.apexauto.entity.User;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.services.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/users/me/carts")
public class UserCartController {

    private final CartService cartService;

    public UserCartController(CartService cartService) {
        this.cartService = cartService;
    }

    // GET /users/me/carts - returns all carts for the authenticated user.
    @GetMapping
    public ResponseEntity<List<CartResponseDTO>> getCartsByUserId(@AuthenticationPrincipal User currentUser) {
        try {
            List<CartResponseDTO> carts = cartService.getCartsByUserId(currentUser.getUserId())
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();

            return ResponseEntity.ok(carts);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // GET /users/me/carts/active - returns the authenticated user's latest ACTIVE cart.
    @GetMapping("/active")
    public ResponseEntity<CartResponseDTO> getActiveCartByUserId(@AuthenticationPrincipal User currentUser) {
        try {
            Carts cart = cartService.getActiveCartByUserId(currentUser.getUserId());
            return ResponseEntity.ok(toResponseDTO(cart));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /users/me/carts - creates a cart for the authenticated user.
    @PostMapping
    public ResponseEntity<CartResponseDTO> createCartForUser(
            @AuthenticationPrincipal User currentUser,
            @RequestBody(required = false) CreateCartDTO request
    ) {
        try {
            Carts saved = cartService.createCartForUser(currentUser.getUserId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
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
                cartLine.getCartLineId(),
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
                cartLine.getTotalInterest(),
                vehicle.getImageUrl()
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