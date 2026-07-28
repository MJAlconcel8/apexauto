package com.example.apexauto.chatbot;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SiteKnowledgeServiceTest {

    @Test
    void customerGuideIncludesCurrentFeaturesAndSimulationLimits() {
        SiteKnowledgeService service = new SiteKnowledgeService(
                new ClassPathResource("chatbot/apexauto-site-knowledge.txt")
        );

        String knowledge = service.getKnowledge();

        assertFalse(knowledge.isBlank());
        assertTrue(knowledge.contains("Catalogue"));
        assertTrue(knowledge.contains("Favorites"));
        assertTrue(knowledge.contains("Compare"));
        assertTrue(knowledge.contains("Loan Calc"));
        assertTrue(knowledge.contains("Add to Cart"));
        assertTrue(knowledge.contains("Place Order"));
        assertTrue(knowledge.contains("1 to 5 stars"));
        assertTrue(knowledge.contains("project simulations"));
        assertTrue(knowledge.contains("React and TypeScript"));
        assertTrue(knowledge.contains("Spring Boot"));
        assertTrue(knowledge.contains("MySQL"));
        assertTrue(knowledge.contains("Vercel"));
        assertTrue(knowledge.contains("Railway"));
    }
}
