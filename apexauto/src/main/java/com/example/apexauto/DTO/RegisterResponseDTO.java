package com.example.apexauto.DTO;

import com.example.apexauto.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegisterResponseDTO {

    private User user;
    private String emailVerificationToken;

}

