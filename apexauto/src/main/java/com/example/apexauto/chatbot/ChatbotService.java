package com.example.apexauto.chatbot;

import com.example.apexauto.chatbot.dto.ChatMessageDTO;
import com.example.apexauto.chatbot.dto.ChatbotRequestDTO;
import com.example.apexauto.chatbot.dto.ChatbotResponseDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class ChatbotService {

    private static final int MAX_MESSAGE_LENGTH = 1_000;
    private static final int MAX_HISTORY_MESSAGES = 6;
    private static final int MAX_HISTORY_MESSAGE_LENGTH = 2_000;

    private final GeminiChatClient geminiChatClient;
    private final SiteKnowledgeService siteKnowledgeService;

    public ChatbotService(
            GeminiChatClient geminiChatClient,
            SiteKnowledgeService siteKnowledgeService
    ) {
        this.geminiChatClient = geminiChatClient;
        this.siteKnowledgeService = siteKnowledgeService;
    }

    public ChatbotResponseDTO chat(ChatbotRequestDTO request) {
        List<ChatMessageDTO> conversation = buildConversation(request);
        String reply = geminiChatClient.createResponse(
                conversation,
                siteKnowledgeService.getKnowledge()
        );
        return new ChatbotResponseDTO(reply);
    }

    private List<ChatMessageDTO> buildConversation(ChatbotRequestDTO request) {
        if (request == null || request.message() == null || request.message().isBlank()) {
            throw new IllegalArgumentException("Message is required");
        }

        List<ChatMessageDTO> conversation = new ArrayList<>();
        List<ChatMessageDTO> history = request.history();

        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - MAX_HISTORY_MESSAGES);
            for (ChatMessageDTO item : history.subList(start, history.size())) {
                ChatMessageDTO cleaned = cleanHistoryMessage(item);
                if (cleaned != null) {
                    conversation.add(cleaned);
                }
            }
        }

        String message = request.message().trim();
        if (message.length() > MAX_MESSAGE_LENGTH) {
            throw new IllegalArgumentException("Message must be 1,000 characters or fewer");
        }

        conversation.add(new ChatMessageDTO("user", message));
        return conversation;
    }

    private ChatMessageDTO cleanHistoryMessage(ChatMessageDTO item) {
        if (item == null || item.role() == null || item.content() == null) {
            return null;
        }

        String role = item.role().trim().toLowerCase(Locale.ROOT);
        if (!role.equals("user") && !role.equals("assistant")) {
            return null;
        }

        String content = item.content().trim();
        if (content.isBlank()) {
            return null;
        }
        if (content.length() > MAX_HISTORY_MESSAGE_LENGTH) {
            content = content.substring(0, MAX_HISTORY_MESSAGE_LENGTH);
        }

        return new ChatMessageDTO(role, content);
    }
}
