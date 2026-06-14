package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor

// This DTO is used to represent the account status of a user, including whether the account is active and any relevant messages.
public class AccountStatusDTO {

    private boolean emailVerified;
    private boolean accountEnabled;
    private boolean accountLocked;

}

