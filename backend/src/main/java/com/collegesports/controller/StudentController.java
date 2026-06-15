package com.collegesports.controller;

import com.collegesports.model.*;
import com.collegesports.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Integer userId) {
        try {
            return ResponseEntity.ok(studentService.getProfileByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Integer userId, @RequestBody StudentProfile profile) {
        try {
            return ResponseEntity.ok(studentService.updateProfile(userId, profile));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/teams/{userId}")
    public ResponseEntity<List<Team>> getStudentTeams(@PathVariable Integer userId) {
        return ResponseEntity.ok(studentService.getStudentTeams(userId));
    }

    @PostMapping("/teams/enroll")
    public ResponseEntity<?> enrollInTeam(@RequestBody Map<String, Integer> payload) {
        try {
            Integer userId = payload.get("userId");
            Integer teamId = payload.get("teamId");
            studentService.enrollInTeam(userId, teamId);
            return ResponseEntity.ok(Map.of("message", "Successfully enrolled in team"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/bookings/{userId}")
    public ResponseEntity<List<Booking>> getBookings(@PathVariable Integer userId) {
        return ResponseEntity.ok(studentService.getStudentBookings(userId));
    }

    @PostMapping("/bookings/{userId}")
    public ResponseEntity<?> createBooking(@PathVariable Integer userId, @RequestBody Booking booking) {
        try {
            return ResponseEntity.ok(studentService.createBooking(userId, booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/performance/{userId}")
    public ResponseEntity<List<PerformanceRecord>> getPerformance(@PathVariable Integer userId) {
        return ResponseEntity.ok(studentService.getPerformanceRecords(userId));
    }

    @GetMapping("/notifications/{userId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Integer userId) {
        return ResponseEntity.ok(studentService.getNotifications(userId));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Integer id) {
        try {
            studentService.markNotificationAsRead(id);
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
