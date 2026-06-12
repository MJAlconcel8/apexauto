package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

// This DTO is used to represent the data required for a user to request a password reset, including their email address.

public class ForgotPasswordDTO {

    private String email;

}

