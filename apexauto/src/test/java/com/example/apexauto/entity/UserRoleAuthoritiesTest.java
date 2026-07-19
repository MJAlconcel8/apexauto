package com.example.apexauto.entity;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UserRoleAuthoritiesTest {

    @Test
    void userRoleCreatesUserAuthority() {
        User user = new User();
        user.setRoleName("USER");

        assertEquals("ROLE_USER", onlyAuthority(user));
    }

    @Test
    void adminRoleCreatesAdminAuthority() {
        User user = new User();
        user.setRoleName("admin");

        assertEquals("ROLE_ADMIN", onlyAuthority(user));
    }

    @Test
    void prefixedRoleIsNotDoublePrefixed() {
        User user = new User();
        user.setRoleName("ROLE_ADMIN");

        assertEquals("ROLE_ADMIN", onlyAuthority(user));
    }

    private String onlyAuthority(User user) {
        return user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElseThrow();
    }
}
