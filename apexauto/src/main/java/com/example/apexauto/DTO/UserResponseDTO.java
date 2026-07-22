package com.example.apexauto.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

// DTO returned when listing or managing user accounts. Never exposes the password or security tokens.
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDTO {

    private int userId;
    private String firstName;
    private String lastName;
    private String email;
    private String roleName;
    private boolean emailVerified;
    private boolean accountEnabled;
    private boolean accountLocked;
    private Date restrictedUntil;
    private Date createdAt;
}
