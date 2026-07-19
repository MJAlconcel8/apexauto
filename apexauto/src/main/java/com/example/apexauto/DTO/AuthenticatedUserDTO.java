package com.example.apexauto.DTO;

import com.example.apexauto.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticatedUserDTO {
    private int userId;
    private String firstName;
    private String lastName;
    private String email;
    private String roleName;

    public static AuthenticatedUserDTO from(User user) {
        return new AuthenticatedUserDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRoleName()
        );
    }
}
