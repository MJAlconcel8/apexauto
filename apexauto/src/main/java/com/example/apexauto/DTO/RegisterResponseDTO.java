package com.example.apexauto.DTO;

import com.example.apexauto.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

// This DTO is used to represent the response sent back to the client after a successful registration, including the user details and any relevant messages.
public class RegisterResponseDTO {

    private User user;
    private String emailVerificationToken;

}

