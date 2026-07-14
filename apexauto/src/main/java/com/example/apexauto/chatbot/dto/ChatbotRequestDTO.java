package com.example.apexauto.chatbot.dto;

import java.util.List;

public record ChatbotRequestDTO(String message, List<ChatMessageDTO> history) {
}
