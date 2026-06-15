package com.collegesports.controller;

import com.collegesports.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    @GetMapping("/predict-performance/{studentId}")
    public ResponseEntity<?> predictPerformance(@PathVariable Integer studentId) {
        try {
            return ResponseEntity.ok(aiService.predictPlayerPerformance(studentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/predict-match-outcome/{matchId}")
    public ResponseEntity<?> predictMatchOutcome(@PathVariable Integer matchId) {
        try {
            return ResponseEntity.ok(aiService.predictMatchOutcome(matchId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/training-recommendations/{studentId}")
    public ResponseEntity<?> getTrainingRecommendations(@PathVariable Integer studentId) {
        try {
            return ResponseEntity.ok(aiService.getTrainingRecommendations(studentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/chatbot/query")
    public ResponseEntity<?> chatbotQuery(@RequestBody Map<String, Object> payload) {
        try {
            String message = (String) payload.get("message");
            Integer userId = null;
            if (payload.get("userId") != null) {
                userId = Integer.parseInt(payload.get("userId").toString());
            }
            return ResponseEntity.ok(aiService.chatbotQuery(message, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
