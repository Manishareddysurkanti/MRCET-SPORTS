package com.collegesports.controller;

import com.collegesports.service.FacilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/facility")
public class FacilityController {

    @Autowired
    private FacilityService facilityService;

    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings() {
        return ResponseEntity.ok(facilityService.getAllBookings());
    }

    @PostMapping("/bookings/{bookingId}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Integer bookingId) {
        try {
            return ResponseEntity.ok(facilityService.approveBooking(bookingId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bookings/{bookingId}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Integer bookingId) {
        try {
            return ResponseEntity.ok(facilityService.rejectBooking(bookingId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/equipment/{equipmentId}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Integer equipmentId, @RequestBody Map<String, Integer> payload) {
        try {
            Integer totalQty = payload.get("totalQty");
            Integer availableQty = payload.get("availableQty");
            return ResponseEntity.ok(facilityService.updateEquipmentStock(equipmentId, totalQty, availableQty));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
