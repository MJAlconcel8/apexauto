package com.example.apexauto.chatbot;

import com.example.apexauto.chatbot.dto.ChatMessageDTO;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

class GeminiChatClientTest {

    @Test
    void createResponseRequiresApiKey() {
        GeminiChatClient client = new GeminiChatClient("", "gemini-3.1-flash-lite", 300);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> client.createResponse(
                        List.of(new ChatMessageDTO("user", "Hello")),
                        "project facts"
                )
        );

        assertEquals(SERVICE_UNAVAILABLE, exception.getStatusCode());
    }

    @Test
    void constructorRejectsInvalidModelName() {
        assertThrows(
                IllegalArgumentException.class,
                () -> new GeminiChatClient("key", "invalid/model", 300)
        );
    }
}
