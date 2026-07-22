package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO used when changing a user's role (e.g. granting or revoking admin rights).
@Getter
@Setter
@NoArgsConstructor
public class UpdateUserRoleDTO {

    private String roleName;
}
