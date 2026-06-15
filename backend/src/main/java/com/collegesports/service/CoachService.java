package com.collegesports.service;

import com.collegesports.model.*;
import com.collegesports.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CoachService {

    @Autowired
    private CoachProfileRepository coachProfileRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PerformanceRecordRepository performanceRecordRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public CoachProfile getProfileByUserId(Integer userId) {
        return coachProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Coach profile not found for user: " + userId));
    }

    @Transactional
    public CoachProfile updateProfile(Integer userId, CoachProfile updatedProfile) {
        CoachProfile existing = getProfileByUserId(userId);
        existing.setExperience(updatedProfile.getExperience());
        existing.setContact(updatedProfile.getContact());

        User user = existing.getUser();
        user.setName(updatedProfile.getUser().getName());
        userRepository.save(user);

        return coachProfileRepository.save(existing);
    }

    public List<Team> getCoachTeams(Integer coachUserId) {
        return teamRepository.findByCoachId(coachUserId);
    }

    public Set<User> getTeamPlayers(Integer teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        return team.getPlayers();
    }

    @Transactional
    public List<Attendance> recordAttendance(Integer teamId, LocalDate date, Map<Integer, String> studentStatusMap) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        List<Attendance> attendances = new ArrayList<>();
        for (Map.Entry<Integer, String> entry : studentStatusMap.entrySet()) {
            Integer studentId = entry.getKey();
            Attendance.AttendanceStatus status = Attendance.AttendanceStatus.valueOf(entry.getValue());

            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

            Optional<Attendance> existing = attendanceRepository
                    .findByTeamIdAndStudentIdAndAttendanceDate(teamId, studentId, date);

            Attendance attendance;
            if (existing.isPresent()) {
                attendance = existing.get();
                attendance.setStatus(status);
            } else {
                attendance = new Attendance(team, student, date, status);
            }
            attendances.add(attendanceRepository.save(attendance));
        }
        return attendances;
    }

    public List<Attendance> getAttendanceHistory(Integer teamId) {
        return attendanceRepository.findByTeamId(teamId);
    }

    @Transactional
    public PerformanceRecord recordPerformance(Integer studentId, Integer sportId, Integer matchId, Integer score, String statsJson, String feedback) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Let's dynamically lookup sport
        Sport sport = new Sport();
        sport.setId(sportId);

        Match match = null;
        if (matchId != null) {
            match = new Match();
            match.setId(matchId);
        }

        PerformanceRecord record = new PerformanceRecord(
                student, sport, match, score, statsJson, feedback, LocalDate.now()
        );

        PerformanceRecord saved = performanceRecordRepository.save(record);

        // Notify student of new performance update
        Notification notification = new Notification(
                "New Performance Record Added",
                "Coach has added a new performance record for you. Score: " + score + "/100. Feedback: " + feedback,
                student,
                false
        );
        notificationRepository.save(notification);

        return saved;
    }

    public Map<String, Object> getTeamAnalytics(Integer teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        Set<User> players = team.getPlayers();
        List<Attendance> attendances = attendanceRepository.findByTeamId(teamId);

        // Calculate Attendance Rate
        double attendanceRate = 0.0;
        if (!attendances.isEmpty()) {
            long presentCount = attendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.Present).count();
            attendanceRate = (double) presentCount / attendances.size() * 100;
        }

        // Calculate Average Performance Score of players in this sport
        List<PerformanceRecord> performanceRecords = performanceRecordRepository.findBySportId(team.getSport().getId());
        
        // Filter by student ID in players
        Set<Integer> playerIds = players.stream().map(User::getId).collect(Collectors.toSet());
        List<PerformanceRecord> teamRecords = performanceRecords.stream()
                .filter(pr -> playerIds.contains(pr.getStudent().getId()))
                .collect(Collectors.toList());

        double avgPerformanceScore = 0.0;
        if (!teamRecords.isEmpty()) {
            avgPerformanceScore = teamRecords.stream()
                    .mapToInt(PerformanceRecord::getPerformanceScore)
                    .average()
                    .orElse(0.0);
        }

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("teamName", team.getName());
        analytics.put("playerCount", players.size());
        analytics.put("attendanceRate", Math.round(attendanceRate * 100.0) / 100.0);
        analytics.put("avgPerformanceScore", Math.round(avgPerformanceScore * 100.0) / 100.0);
        analytics.put("performanceRecordCount", teamRecords.size());

        return analytics;
    }
}
