package com.example.apexauto.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmailVerification(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Verify your ApexAuto email");
        message.setText(
                "Welcome to ApexAuto!\n\n" +
                "Copy the token below and paste it into the Email Verification page:\n\n" +
                token + "\n\n" +
                "This token expires in 24 hours."
        );
        mailSender.send(message);
    }

    public void sendPasswordReset(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Reset your ApexAuto password");
        message.setText(
                "You requested a password reset.\n\n" +
                "Copy the token below and paste it into the Reset Password page:\n\n" +
                token + "\n\n" +
                "This token expires in 1 hour. If you did not request this, ignore this email."
        );
        mailSender.send(message);
    }
}
