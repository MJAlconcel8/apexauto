package com.example.apexauto.services;

import com.example.apexauto.DTO.LoginUserDTO;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

@Component

// This class is responsible for mapping the LoginUserDTO to a UsernamePasswordAuthenticationToken, which is used by Spring Security to perform authentication.
public class LoginUserMapper {

    public UsernamePasswordAuthenticationToken toAuthenticationToken(LoginUserDTO loginUserDTO) {
        return new UsernamePasswordAuthenticationToken(
                loginUserDTO.getEmail(),
                loginUserDTO.getPassword()
        );
    }

}

