package com.example.apexauto.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Sends the email verification message asynchronously so callers (e.g. signup) are not
    // blocked while waiting on the SMTP connection. Failures are logged instead of propagated
    // so they do not affect the outcome of the originating request.
    @Async
    public void sendEmailVerification(String toEmail, String token) {
        try {
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
        } catch (Exception ex) {
            logger.error("Failed to send email verification message to {}", toEmail, ex);
        }
    }

    // Sends the password reset message asynchronously for the same reason as above.
    @Async
    public void sendPasswordReset(String toEmail, String token) {
        try {
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
        } catch (Exception ex) {
            logger.error("Failed to send password reset message to {}", toEmail, ex);
        }
    }
}
