package com.example.apexauto.chatbot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class SiteKnowledgeService {

    private final String knowledge;

    public SiteKnowledgeService(
            @Value("classpath:chatbot/apexauto-site-knowledge.txt") Resource resource
    ) {
        try (var inputStream = resource.getInputStream()) {
            this.knowledge = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8).trim();
        } catch (IOException exception) {
            throw new IllegalStateException("Could not load chatbot site knowledge", exception);
        }
    }

    public String getKnowledge() {
        return knowledge;
    }
}
