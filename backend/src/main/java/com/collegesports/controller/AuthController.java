package com.collegesports.controller;

import com.collegesports.model.Sport;
import com.collegesports.model.User;
import com.collegesports.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            Map<String, Object> response = authService.login(email, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, String> userMap = (Map<String, String>) payload.get("user");
            User user = new User(
                    userMap.get("name"),
                    userMap.get("email"),
                    userMap.get("password"),
                    User.Role.STUDENT
            );

            String rollNo = (String) payload.get("rollNo");
            String dept = (String) payload.get("dept");
            Integer year = Integer.parseInt(payload.get("year").toString());
            String contact = (String) payload.get("contact");

            User registered = authService.registerStudent(user, rollNo, dept, year, contact);
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register/coach")
    public ResponseEntity<?> registerCoach(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, String> userMap = (Map<String, String>) payload.get("user");
            User user = new User(
                    userMap.get("name"),
                    userMap.get("email"),
                    userMap.get("password"),
                    User.Role.COACH
            );

            Integer sportId = Integer.parseInt(payload.get("sportId").toString());
            Integer experience = Integer.parseInt(payload.get("experience").toString());
            String contact = (String) payload.get("contact");

            Sport sport = new Sport();
            sport.setId(sportId);

            User registered = authService.registerCoach(user, sport, experience, contact);
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
