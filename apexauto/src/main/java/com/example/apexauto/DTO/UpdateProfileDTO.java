package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO used when the signed-in user updates their own first name, last name, and/or email.
// Changing the email address requires re-verification.
@Getter
@Setter
@NoArgsConstructor
public class UpdateProfileDTO {

    private String firstName;
    private String lastName;
    private String email;
}
