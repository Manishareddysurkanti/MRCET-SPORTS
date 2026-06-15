package com.collegesports.controller;

import com.collegesports.model.*;
import com.collegesports.service.CoachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/coach")
public class CoachController {

    @Autowired
    private CoachService coachService;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Integer userId) {
        try {
            return ResponseEntity.ok(coachService.getProfileByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Integer userId, @RequestBody CoachProfile profile) {
        try {
            return ResponseEntity.ok(coachService.updateProfile(userId, profile));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/teams/{userId}")
    public ResponseEntity<List<Team>> getCoachTeams(@PathVariable Integer userId) {
        return ResponseEntity.ok(coachService.getCoachTeams(userId));
    }

    @GetMapping("/team-players/{teamId}")
    public ResponseEntity<Set<User>> getTeamPlayers(@PathVariable Integer teamId) {
        return ResponseEntity.ok(coachService.getTeamPlayers(teamId));
    }

    @PostMapping("/attendance")
    public ResponseEntity<?> recordAttendance(@RequestBody Map<String, Object> payload) {
        try {
            Integer teamId = Integer.parseInt(payload.get("teamId").toString());
            LocalDate date = LocalDate.parse(payload.get("date").toString());
            Map<Integer, String> statusMap = (Map<Integer, String>) payload.get("statusMap");

            // Convert keys of statusMap from string to integer (due to JSON mapping)
            Map<Integer, String> parsedStatusMap = statusMap.entrySet().stream()
                    .collect(java.util.stream.Collectors.toMap(
                            e -> Integer.parseInt(e.getKey().toString()),
                            Map.Entry::getValue
                    ));

            List<Attendance> attendances = coachService.recordAttendance(teamId, date, parsedStatusMap);
            return ResponseEntity.ok(attendances);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attendance/{teamId}")
    public ResponseEntity<List<Attendance>> getAttendanceHistory(@PathVariable Integer teamId) {
        return ResponseEntity.ok(coachService.getAttendanceHistory(teamId));
    }

    @PostMapping("/performance")
    public ResponseEntity<?> recordPerformance(@RequestBody Map<String, Object> payload) {
        try {
            Integer studentId = Integer.parseInt(payload.get("studentId").toString());
            Integer sportId = Integer.parseInt(payload.get("sportId").toString());
            
            Integer matchId = null;
            if (payload.get("matchId") != null) {
                matchId = Integer.parseInt(payload.get("matchId").toString());
            }

            Integer score = Integer.parseInt(payload.get("score").toString());
            String statsJson = (String) payload.get("statsJson");
            String feedback = (String) payload.get("feedback");

            PerformanceRecord record = coachService.recordPerformance(studentId, sportId, matchId, score, statsJson, feedback);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/team-analytics/{teamId}")
    public ResponseEntity<Map<String, Object>> getTeamAnalytics(@PathVariable Integer teamId) {
        return ResponseEntity.ok(coachService.getTeamAnalytics(teamId));
    }
}
