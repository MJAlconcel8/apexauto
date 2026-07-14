package com.example.apexauto.chatbot;

import com.example.apexauto.chatbot.dto.ChatMessageDTO;
import com.example.apexauto.chatbot.dto.ChatbotRequestDTO;
import com.example.apexauto.chatbot.dto.ChatbotResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatbotServiceTest {

    @Mock
    private GeminiChatClient geminiChatClient;

    @Mock
    private SiteKnowledgeService siteKnowledgeService;

    private ChatbotService chatbotService;

    @BeforeEach
    void setUp() {
        chatbotService = new ChatbotService(geminiChatClient, siteKnowledgeService);
    }

    @Test
    void chatUsesRecentHistoryAndTrimmedMessage() {
        List<ChatMessageDTO> history = List.of(
                new ChatMessageDTO("user", "first"),
                new ChatMessageDTO("assistant", "second"),
                new ChatMessageDTO("user", "third"),
                new ChatMessageDTO("assistant", "fourth"),
                new ChatMessageDTO("user", "fifth"),
                new ChatMessageDTO("assistant", "sixth"),
                new ChatMessageDTO("user", "seventh")
        );

        when(siteKnowledgeService.getKnowledge()).thenReturn("project facts");
        when(geminiChatClient.createResponse(anyList(), eq("project facts")))
                .thenReturn("Gemini reply");

        ChatbotResponseDTO response = chatbotService.chat(
                new ChatbotRequestDTO("  current question  ", history)
        );

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<ChatMessageDTO>> conversationCaptor = ArgumentCaptor.forClass(List.class);
        verify(geminiChatClient).createResponse(conversationCaptor.capture(), eq("project facts"));

        List<ChatMessageDTO> conversation = conversationCaptor.getValue();
        assertEquals("Gemini reply", response.message());
        assertEquals(7, conversation.size());
        assertEquals("second", conversation.get(0).content());
        assertEquals("current question", conversation.get(6).content());
    }

    @Test
    void chatRejectsBlankMessage() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> chatbotService.chat(new ChatbotRequestDTO("   ", List.of()))
        );

        assertEquals("Message is required", exception.getMessage());
    }

    @Test
    void chatRejectsMessageOverLimit() {
        String message = "a".repeat(1_001);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> chatbotService.chat(new ChatbotRequestDTO(message, List.of()))
        );

        assertEquals("Message must be 1,000 characters or fewer", exception.getMessage());
    }
}
