package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO returned when login fails, so the frontend can distinguish specific failure reasons
// (e.g. an unverified email) from generic invalid credentials.
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginErrorDTO {

    private String error;
    private String code;
}
