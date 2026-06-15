package com.collegesports.controller;

import com.collegesports.model.*;
import com.collegesports.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentProfile>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @GetMapping("/coaches")
    public ResponseEntity<List<CoachProfile>> getAllCoaches() {
        return ResponseEntity.ok(adminService.getAllCoaches());
    }

    @GetMapping("/sports")
    public ResponseEntity<List<Sport>> getAllSports() {
        return ResponseEntity.ok(adminService.getAllSports());
    }

    @PostMapping("/sports")
    public ResponseEntity<?> saveSport(@RequestBody Sport sport) {
        try {
            return ResponseEntity.ok(adminService.saveSport(sport));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/sports/{id}")
    public ResponseEntity<?> deleteSport(@PathVariable Integer id) {
        try {
            adminService.deleteSport(id);
            return ResponseEntity.ok(Map.of("message", "Sport deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/grounds")
    public ResponseEntity<List<Ground>> getAllGrounds() {
        return ResponseEntity.ok(adminService.getAllGrounds());
    }

    @PostMapping("/grounds")
    public ResponseEntity<?> saveGround(@RequestBody Ground ground) {
        try {
            return ResponseEntity.ok(adminService.saveGround(ground));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/grounds/{id}")
    public ResponseEntity<?> deleteGround(@PathVariable Integer id) {
        try {
            adminService.deleteGround(id);
            return ResponseEntity.ok(Map.of("message", "Ground deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/equipment")
    public ResponseEntity<List<Equipment>> getAllEquipment() {
        return ResponseEntity.ok(adminService.getAllEquipment());
    }

    @PostMapping("/equipment")
    public ResponseEntity<?> saveEquipment(@RequestBody Equipment equipment) {
        try {
            return ResponseEntity.ok(adminService.saveEquipment(equipment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/equipment/{id}")
    public ResponseEntity<?> deleteEquipment(@PathVariable Integer id) {
        try {
            adminService.deleteEquipment(id);
            return ResponseEntity.ok(Map.of("message", "Equipment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
