package com.collegesports.service;

import com.collegesports.model.*;
import com.collegesports.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PerformanceRecordRepository performanceRecordRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public StudentProfile getProfileByUserId(Integer userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + userId));
    }

    @Transactional
    public StudentProfile updateProfile(Integer userId, StudentProfile updatedProfile) {
        StudentProfile existing = getProfileByUserId(userId);
        existing.setDept(updatedProfile.getDept());
        existing.setYear(updatedProfile.getYear());
        existing.setContact(updatedProfile.getContact());
        existing.setAchievements(updatedProfile.getAchievements());

        User user = existing.getUser();
        user.setName(updatedProfile.getUser().getName());
        userRepository.save(user);

        return studentProfileRepository.save(existing);
    }

    public List<Team> getStudentTeams(Integer userId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return teamRepository.findAll().stream()
                .filter(t -> t.getPlayers().contains(student) || t.getCaptain().getId().equals(userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void enrollInTeam(Integer userId, Integer teamId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        team.getPlayers().add(student);
        teamRepository.save(team);

        // Add Notification
        Notification notification = new Notification(
                "Enrolled in Team: " + team.getName(),
                student.getName() + " has successfully registered/enrolled in " + team.getName() + " (" + team.getSport().getName() + ").",
                student,
                false
        );
        notificationRepository.save(notification);
    }

    public List<Booking> getStudentBookings(Integer userId) {
        return bookingRepository.findByUserId(userId);
    }

    @Transactional
    public Booking createBooking(Integer userId, Booking booking) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        booking.setUser(user);
        booking.setStatus(Booking.BookingStatus.Pending);
        return bookingRepository.save(booking);
    }

    public List<PerformanceRecord> getPerformanceRecords(Integer userId) {
        return performanceRecordRepository.findByStudentId(userId);
    }

    public List<Notification> getNotifications(Integer userId) {
        return notificationRepository.findByUserIdOrUserIsNullOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markNotificationAsRead(Integer notificationId) {
        Optional<Notification> notifOpt = notificationRepository.findById(notificationId);
        if (notifOpt.isPresent()) {
            Notification n = notifOpt.get();
            n.setIsRead(true);
            notificationRepository.save(n);
        }
    }
}
