package com.example.apexauto.exceptions;

// Thrown when a login attempt fails because the account's email address has not been verified yet.
public class EmailNotVerifiedException extends RuntimeException {

    private final String email;

    public EmailNotVerifiedException(String email, Throwable cause) {
        super("Email not verified", cause);
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
