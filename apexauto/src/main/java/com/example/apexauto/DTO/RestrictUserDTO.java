package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

// DTO used to temporarily restrict (block) a user's account until a given date, or lift a restriction by sending null.
@Getter
@Setter
@NoArgsConstructor
public class RestrictUserDTO {

    private Date restrictedUntil;
}
