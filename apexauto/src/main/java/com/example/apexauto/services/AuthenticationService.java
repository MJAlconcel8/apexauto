package com.example.apexauto.services;

import com.example.apexauto.DTO.LoginUserDTO;
import com.example.apexauto.DTO.RegisterUserDTO;
import com.example.apexauto.entity.User;
import com.example.apexauto.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final RegisterUserMapper registerUserMapper;
    private final LoginUserMapper loginUserMapper;

    public AuthenticationService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            RegisterUserMapper registerUserMapper,
            LoginUserMapper loginUserMapper
    ) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.registerUserMapper = registerUserMapper;
        this.loginUserMapper = loginUserMapper;
    }

    public User signup(RegisterUserDTO input) {
        return userRepository.save(registerUserMapper.toUser(input));
    }

    public User authenticate(LoginUserDTO input) {
        authenticationManager.authenticate(loginUserMapper.toAuthenticationToken(input));

        return userRepository.findByEmail(input.getEmail())
                .orElseThrow();
    }
}
