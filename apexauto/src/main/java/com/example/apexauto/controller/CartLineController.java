package com.example.apexauto.controller;

import com.example.apexauto.DTO.CartLineResponseDTO;
import com.example.apexauto.DTO.CartResponseDTO;
import com.example.apexauto.DTO.CreateCartLineDTO;
import com.example.apexauto.entity.CartLine;
import com.example.apexauto.entity.Carts;
import com.example.apexauto.entity.Vehicle;
import com.example.apexauto.services.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/carts/{cartId}/cart-lines")
public class CartLineController {

    private final CartService cartService;

    public CartLineController(CartService cartService) {
        this.cartService = cartService;
    }

    // GET /carts/{cartId}/cart-lines - returns vehicles inside the authenticated user's cart.
    @GetMapping
    public ResponseEntity<List<CartLineResponseDTO>> getCartLines(@PathVariable int cartId) {
        try {
            List<CartLineResponseDTO> cartLines = cartService.getCartLinesForUser(cartId)
                    .stream()
                    .map(this::toCartLineResponseDTO)
                    .toList();

            return ResponseEntity.ok(cartLines);
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // POST /carts/{cartId}/cart-lines - adds one vehicle to a cart.
    @PostMapping
    public ResponseEntity<CartResponseDTO> addVehicleToCart(
            @PathVariable int cartId,
            @RequestBody CreateCartLineDTO request
    ) {
        try {
            if (request == null) {
                throw new IllegalArgumentException("Cart line request must not be null");
            }

            Carts updated = cartService.addVehicleToCart(
                    cartId,
                    request.getVehicleId(),
                    request.getQuantity(),
                    request.isFinancingSelected(),
                    request.getDownPayment(),
                    request.getAnnualRate(),
                    request.getTermMonths()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(toCartResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    // DELETE /carts/{cartId}/cart-lines/{cartLineId} - removes one specific cart line.
    @DeleteMapping("/{cartLineId}")
    public ResponseEntity<CartResponseDTO> removeVehicleFromCart(
            @PathVariable int cartId,
            @PathVariable int cartLineId
    ) {
        try {
            Carts updated = cartService.removeVehicleFromCart(cartId, cartLineId);
            return ResponseEntity.ok(toCartResponseDTO(updated));
        } catch (IllegalArgumentException ex) {
            throw toHttpException(ex);
        }
    }

    private CartResponseDTO toCartResponseDTO(Carts cart) {
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
                cartLine.getTotalInterest()
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