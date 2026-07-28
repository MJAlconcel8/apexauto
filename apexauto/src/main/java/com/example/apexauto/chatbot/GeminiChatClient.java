package com.example.apexauto.chatbot;

import com.example.apexauto.chatbot.dto.ChatMessageDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_GATEWAY;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

@Component
public class GeminiChatClient {

    private static final Logger logger = LoggerFactory.getLogger(GeminiChatClient.class);

    private static final String INSTRUCTIONS = """
            You are Amp, the customer-facing chatbot built into ApexAuto.
            Help with basic electric-vehicle questions and questions about the ApexAuto application.
            For ApexAuto-specific questions, use only the project facts included below.
            If the facts do not cover something, clearly say that you do not know.

            Explain the website from a regular customer's point of view. Use the exact visible labels
            from the interface, such as Catalogue, Favorites, Compare, Loan Calc, Finance, Add to Cart,
            and Place Order. Give short steps that say which visible menu item, button, icon, tab, or
            section to select and where it appears. Do not mention internal slash routes unless the user
            explicitly asks a technical question about routing or architecture.

            Clearly identify account requirements and clearly explain that ApexAuto's inventory,
            financing, checkout, orders, payment fields, and delivery details are project simulations.
            Never imply that a real payment, loan, reservation, purchase, or delivery has occurred.
            Do not provide administrator instructions.

            You cannot view live inventory or private account, favorite, cart, order, payment, or
            database data. Do not claim that you clicked a button, changed data, or performed an action.
            Do not request passwords, verification or reset tokens, API keys, JWTs, access tokens, or
            payment-card details.

            Use English by default. When the user writes clearly in another language, answer in that
            language when practical. Keep responses concise, friendly, and easy to understand.
            """;

    private final RestClient restClient;
    private final String apiKey;
    private final String model;
    private final int maxOutputTokens;

    public GeminiChatClient(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-3.1-flash-lite}") String model,
            @Value("${chatbot.max-output-tokens:300}") int maxOutputTokens
    ) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(30));

        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .requestFactory(requestFactory)
                .build();
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = normalizeModel(model);
        this.maxOutputTokens = Math.max(50, Math.min(maxOutputTokens, 500));
    }

    public String createResponse(List<ChatMessageDTO> conversation, String siteKnowledge) {
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(
                    SERVICE_UNAVAILABLE,
                    "Chatbot is not configured. Add GEMINI_API_KEY to the backend .env file."
            );
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("systemInstruction", content(INSTRUCTIONS + "\n\nApexAuto project facts:\n" + siteKnowledge));
        body.put("contents", buildContents(conversation));
        body.put("generationConfig", Map.of(
                "maxOutputTokens", maxOutputTokens,
                "temperature", 0.4
        ));

        try {
            Map<?, ?> response = restClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            String text = extractText(response);
            if (text == null || text.isBlank()) {
                throw new ResponseStatusException(BAD_GATEWAY, "Gemini returned an empty response");
            }
            return text.trim();
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (RestClientResponseException exception) {
            logger.error(
                    "Gemini returned HTTP {}: {}",
                    exception.getStatusCode(),
                    exception.getResponseBodyAsString()
            );

            if (exception.getStatusCode().value() == 429) {
                throw new ResponseStatusException(
                        SERVICE_UNAVAILABLE,
                        "Gemini API quota was reached. Try again later.",
                        exception
                );
            }
            throw new ResponseStatusException(
                    BAD_GATEWAY,
                    "Gemini rejected the request. Check the API key and model name.",
                    exception
            );
        } catch (RestClientException exception) {
            logger.error("Could not contact Gemini", exception);
            throw new ResponseStatusException(
                    BAD_GATEWAY,
                    "Could not get a response from Gemini",
                    exception
            );
        } catch (RuntimeException exception) {
            logger.error("Unexpected Gemini response error", exception);
            throw new ResponseStatusException(
                    BAD_GATEWAY,
                    "Could not read the response from Gemini",
                    exception
            );
        }
    }

    private List<Map<String, Object>> buildContents(List<ChatMessageDTO> conversation) {
        List<Map<String, Object>> contents = new ArrayList<>();
        for (ChatMessageDTO message : conversation) {
            Map<String, Object> content = content(message.content());
            content.put("role", "assistant".equals(message.role()) ? "model" : "user");
            contents.add(content);
        }
        return contents;
    }

    private Map<String, Object> content(String text) {
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("parts", List.of(Map.of("text", text)));
        return content;
    }

    private String extractText(Map<?, ?> response) {
        if (response == null || !(response.get("candidates") instanceof List<?> candidates)) {
            return null;
        }

        StringBuilder text = new StringBuilder();
        for (Object candidateValue : candidates) {
            if (!(candidateValue instanceof Map<?, ?> candidate)) {
                continue;
            }
            if (!(candidate.get("content") instanceof Map<?, ?> candidateContent)) {
                continue;
            }
            if (!(candidateContent.get("parts") instanceof List<?> parts)) {
                continue;
            }

            for (Object partValue : parts) {
                if (!(partValue instanceof Map<?, ?> part)) {
                    continue;
                }
                Object value = part.get("text");
                if (value instanceof String partText && !partText.isBlank()) {
                    if (!text.isEmpty()) {
                        text.append(System.lineSeparator());
                    }
                    text.append(partText);
                }
            }
        }
        return text.toString();
    }

    private String normalizeModel(String value) {
        String selected = value == null || value.isBlank() ? "gemini-3.1-flash-lite" : value.trim();
        if (!selected.matches("[A-Za-z0-9._-]+")) {
            throw new IllegalArgumentException("Invalid Gemini model name");
        }
        return selected;
    }
}
