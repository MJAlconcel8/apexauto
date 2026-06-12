package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

// This DTO is used to represent the response sent back to the client after a successful login, including the JWT token and any relevant messages.
public class LoginResponseDTO {

    private String token;
    private long expiresIn;

}

