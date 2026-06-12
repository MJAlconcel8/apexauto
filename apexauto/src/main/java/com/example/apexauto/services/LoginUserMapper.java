package com.example.apexauto.services;

import com.example.apexauto.DTO.LoginUserDTO;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class LoginUserMapper {

    public UsernamePasswordAuthenticationToken toAuthenticationToken(LoginUserDTO loginUserDTO) {
        return new UsernamePasswordAuthenticationToken(
                loginUserDTO.getEmail(),
                loginUserDTO.getPassword()
        );
    }

}

