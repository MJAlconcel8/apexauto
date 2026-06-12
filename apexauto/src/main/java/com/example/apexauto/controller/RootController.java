package com.example.apexauto.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    // GET / — Health check endpoint
    @GetMapping("/")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("{'status': 'ok', 'message': 'ApexAuto API is running'}");
    }

    // GET /health — Alternative health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{'status': 'UP'}");
    }
}

