package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AccountStatusDTO {

    private boolean emailVerified;
    private boolean accountEnabled;
    private boolean accountLocked;

}

