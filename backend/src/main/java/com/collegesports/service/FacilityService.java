package com.collegesports.service;

import com.collegesports.model.*;
import com.collegesports.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GroundRepository groundRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getApprovedBookingsByGround(Integer groundId) {
        return bookingRepository.findByGroundId(groundId).stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Approved)
                .collect(Collectors.toList());
    }

    public boolean checkAvailability(Integer groundId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Booking> bookings = getApprovedBookingsByGround(groundId);
        
        for (Booking b : bookings) {
            if (b.getBookingDate().equals(date)) {
                LocalTime existStart = b.getStartTime();
                LocalTime existEnd = b.getEndTime();
                
                // Check if requested slot overlaps with existing approved slot
                // Overlap exists if: (start1 < end2) AND (end1 > start2)
                if (startTime.isBefore(existEnd) && endTime.isAfter(existStart)) {
                    return false; // Ground is occupied
                }
            }
        }
        return true;
    }

    @Transactional
    public Booking approveBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check if there is a conflict before approving
        boolean available = checkAvailability(
                booking.getGround().getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );

        if (!available) {
            throw new RuntimeException("Cannot approve booking. Another booking overlaps with this time slot!");
        }

        booking.setStatus(Booking.BookingStatus.Approved);
        Booking saved = bookingRepository.save(booking);

        // Notify user
        Notification notification = new Notification(
                "Booking Request Approved",
                "Your booking request for " + booking.getGround().getName() + " on " + booking.getBookingDate() + " has been Approved.",
                booking.getUser(),
                false
        );
        notificationRepository.save(notification);

        return saved;
    }

    @Transactional
    public Booking rejectBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(Booking.BookingStatus.Rejected);
        Booking saved = bookingRepository.save(booking);

        // Notify user
        Notification notification = new Notification(
                "Booking Request Rejected",
                "Your booking request for " + booking.getGround().getName() + " on " + booking.getBookingDate() + " has been Rejected.",
                booking.getUser(),
                false
        );
        notificationRepository.save(notification);

        return saved;
    }

    @Transactional
    public Equipment updateEquipmentStock(Integer equipmentId, Integer totalQty, Integer availableQty) {
        Equipment eq = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        eq.setTotalQty(totalQty);
        eq.setAvailableQty(availableQty);
        return equipmentRepository.save(eq);
    }
}
