package com.example.apexauto.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {

    // This variable holds the AuthenticationProvider bean that will be used for authentication
    private final AuthenticationProvider authenticationProvider;

    // This variable holds the JWTAuthenticationFilter bean that validates JWT tokens on every request
    private final JWTAuthenticationFilter jwtAuthenticationFilter;

    // This is a constructor that takes an AuthenticationProvider and JWTAuthenticationFilter as parameters
    public SecurityConfiguration(AuthenticationProvider authenticationProvider, JWTAuthenticationFilter jwtAuthenticationFilter) {
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // This function is used to configure the security filter chain for the application
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/health", "/error", "/index.html", "/api/chatbot/**").permitAll()
                        .requestMatchers(
                                "/auth/register",
                                "/auth/login",
                                "/auth/logout",
                                "/auth/verify-email",
                                "/auth/account-status",
                                "/auth/forgot-password",
                                "/auth/reset-password"
                        ).permitAll()
                        .requestMatchers("/static/**", "/assets/**", "/css/**", "/js/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/vehicles", "/vehicles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/reviews/vehicles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/vehicle-history/vehicles/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/vehicles/compare").authenticated()
                        .requestMatchers(HttpMethod.POST, "/vehicles").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/reviews").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/reviews/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/orders").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/orders/**").hasRole("ADMIN")
                        .requestMatchers("/auth/me").authenticated()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                );

        return http.build();
    }

    // This function is used to configure CORS settings for the application
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of("http://localhost:*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**",configuration);

        return source;
    }
}

