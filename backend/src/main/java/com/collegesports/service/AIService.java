package com.collegesports.service;

import com.collegesports.model.*;
import com.collegesports.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIService {

    @Autowired
    private PerformanceRecordRepository performanceRecordRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private TournamentRepository tournamentRepository;

    /**
     * Predict player future performance using weighted average and attendance factors.
     */
    public Map<String, Object> predictPlayerPerformance(Integer studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<PerformanceRecord> records = performanceRecordRepository.findByStudentId(studentId);
        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);

        double baseScore = 70.0;
        int performanceCount = records.size();

        if (performanceCount > 0) {
            // Weighted average: more recent performance has higher weight
            double totalWeight = 0;
            double weightedSum = 0;
            for (int i = 0; i < performanceCount; i++) {
                double weight = i + 1; // Later records have higher weight
                weightedSum += records.get(i).getPerformanceScore() * weight;
                totalWeight += weight;
            }
            baseScore = weightedSum / totalWeight;
        }

        // Attendance factor
        double attendanceRate = 80.0;
        if (!attendances.isEmpty()) {
            long present = attendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.Present).count();
            attendanceRate = (double) present / attendances.size() * 100;
        }

        double predictedScore = baseScore;
        // Adjust for attendance
        if (attendanceRate >= 90) {
            predictedScore += 5;
        } else if (attendanceRate < 70) {
            predictedScore -= (70 - attendanceRate) * 0.4;
        }

        // Trend analysis
        String trend = "Stable";
        if (performanceCount >= 2) {
            int firstScore = records.get(0).getPerformanceScore();
            int lastScore = records.get(performanceCount - 1).getPerformanceScore();
            if (lastScore - firstScore > 5) {
                trend = "Improving";
                predictedScore += 3;
            } else if (firstScore - lastScore > 5) {
                trend = "Declining";
                predictedScore -= 4;
            }
        }

        predictedScore = Math.max(10, Math.min(100, predictedScore));
        int confidence = (int) Math.max(50, Math.min(95, 70 + (records.size() * 3) + (attendanceRate * 0.1)));

        List<String> areasForImprovement = new ArrayList<>();
        if (attendanceRate < 85) {
            areasForImprovement.add("Stamina & Attendance: Attend more training sessions regularly to improve core physical conditioning.");
        }
        if (baseScore < 75) {
            areasForImprovement.add("Technical Drills: Dedicate time to fundamental skill practice (e.g. ball control, batting net practice).");
        }
        if (trend.equals("Declining")) {
            areasForImprovement.add("Form Consistency: Work on concentration and mental game under coach guidance.");
        }
        if (areasForImprovement.isEmpty()) {
            areasForImprovement.add("Advanced Tactics: Maintain current form and study opponent patterns to step up strategic gameplay.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("studentName", student.getName());
        response.put("predictedScore", Math.round(predictedScore * 10.0) / 10.0);
        response.put("confidenceScore", confidence);
        response.put("performanceTrend", trend);
        response.put("attendanceRate", Math.round(attendanceRate * 10.0) / 10.0);
        response.put("suggestions", areasForImprovement);

        return response;
    }

    /**
     * Predict match outcome based on team ratings and win rates.
     */
    public Map<String, Object> predictMatchOutcome(Integer matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        Team t1 = match.getTeam1();
        Team t2 = match.getTeam2();

        // Calculate Team 1 Strength
        double strength1 = calculateTeamStrength(t1);
        double strength2 = calculateTeamStrength(t2);

        // Add small home-court or baseline deterministic factor based on ID
        strength1 += (t1.getId() % 3);
        strength2 += (t2.getId() % 3);

        Team predictedWinner;
        double winProbability;

        if (strength1 > strength2) {
            predictedWinner = t1;
            winProbability = 50 + ((strength1 - strength2) / (strength1 + strength2) * 100);
        } else if (strength2 > strength1) {
            predictedWinner = t2;
            winProbability = 50 + ((strength2 - strength1) / (strength1 + strength2) * 100);
        } else {
            predictedWinner = t1; // baseline fallback
            winProbability = 52.0;
        }

        winProbability = Math.max(50.0, Math.min(95.0, winProbability));

        // Generate dynamic reasoning analysis
        List<String> keyFactors = new ArrayList<>();
        keyFactors.add(String.format("%s holds a team strength rating of %.1f vs %s rating of %.1f.", 
                t1.getName(), strength1, t2.getName(), strength2));
        
        if (t1.getPlayers().size() > t2.getPlayers().size()) {
            keyFactors.add(t1.getName() + " has a larger registered roster depth for substitutions.");
        } else if (t2.getPlayers().size() > t1.getPlayers().size()) {
            keyFactors.add(t2.getName() + " benefits from a larger roster depth.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("matchId", match.getId());
        response.put("team1", t1.getName());
        response.put("team2", t2.getName());
        response.put("predictedWinner", predictedWinner.getName());
        response.put("winnerId", predictedWinner.getId());
        response.put("confidenceScore", Math.round(winProbability));
        response.put("reasoning", keyFactors);

        return response;
    }

    private double calculateTeamStrength(Team team) {
        // Find players average performance score in the database
        List<PerformanceRecord> records = performanceRecordRepository.findBySportId(team.getSport().getId());
        Set<Integer> playerIds = team.getPlayers().stream().map(User::getId).collect(Collectors.toSet());
        
        List<PerformanceRecord> teamPlayerRecords = records.stream()
                .filter(r -> playerIds.contains(r.getStudent().getId()))
                .collect(Collectors.toList());

        double avgPerformance = 72.0; // default average rating
        if (!teamPlayerRecords.isEmpty()) {
            avgPerformance = teamPlayerRecords.stream().mapToInt(PerformanceRecord::getPerformanceScore).average().orElse(72.0);
        }

        // Win stats from previous matches
        List<Match> matches = matchRepository.findByTeam1IdOrTeam2Id(team.getId(), team.getId());
        long wins = matches.stream()
                .filter(m -> m.getStatus() == Match.MatchStatus.Completed && m.getWinner() != null && m.getWinner().getId().equals(team.getId()))
                .count();

        return (avgPerformance * 0.7) + (wins * 5.0) + (team.getPlayers().size() * 0.5);
    }

    /**
     * Recommend personalized training plan based on weaknesses.
     */
    public Map<String, Object> getTrainingRecommendations(Integer studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<PerformanceRecord> records = performanceRecordRepository.findByStudentId(studentId);
        
        // Find sport type
        String sportName = "General Fitness";
        String weakness = "Endurance";
        
        if (!records.isEmpty()) {
            PerformanceRecord pr = records.get(records.size() - 1);
            sportName = pr.getSport().getName();
            
            // Check performance scores
            int minScore = records.stream().mapToInt(PerformanceRecord::getPerformanceScore).min().orElse(100);
            if (minScore < 70) {
                weakness = "Consistency and Technical Skill";
            } else {
                weakness = "Stamina and Agility";
            }
        }

        List<String> schedule = new ArrayList<>();
        List<String> exercises = new ArrayList<>();

        if (sportName.equalsIgnoreCase("Cricket")) {
            schedule.add("Mon: High-Intensity Interval Training (HIIT) - 30 mins");
            schedule.add("Wed: Shoulder mobility & Core stability drills");
            schedule.add("Fri: Target net practice & footwork drills");
            
            exercises.add("Resistance band rotator cuff exercises (3 sets x 15 reps)");
            exercises.add("Medicine ball core twists (3 sets x 20 reps)");
            exercises.add("Shuttle runs (6 x 20m sprints)");
        } else if (sportName.equalsIgnoreCase("Basketball")) {
            schedule.add("Mon: Vertical jump training (Plyometrics)");
            schedule.add("Wed: Defensive footwork & lateral agility drills");
            schedule.add("Fri: Shooters-pocket alignment & mid-range shooting practice");
            
            exercises.add("Box jumps (4 sets x 10 reps)");
            exercises.add("Lateral defensive slides (3 sets x 1 min)");
            exercises.add("Planks and side planks for jump stabilization");
        } else if (sportName.equalsIgnoreCase("Football")) {
            schedule.add("Mon: 5km Tempo Run for aerobic capacity");
            schedule.add("Wed: Ball dribbling cones slalom & agility ladders");
            schedule.add("Fri: Lower body power squats & calf extensions");
            
            exercises.add("Weighted squats (4 sets x 8 reps)");
            exercises.add("Agility ladder fast-feet (4 patterns)");
            exercises.add("Sprint-stop-turn-sprint drills (5 sets)");
        } else {
            schedule.add("Mon: Moderate cardiovascular running - 40 mins");
            schedule.add("Wed: Full body bodyweight callisthenics circuit");
            schedule.add("Fri: Flexibility stretching and yoga");
            
            exercises.add("Push-ups & Pull-ups circuit");
            exercises.add("Core bicycle crunches");
            exercises.add("Dynamic lunges (3 sets x 15 reps)");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("studentName", student.getName());
        response.put("sport", sportName);
        response.put("identifiedWeakness", weakness);
        response.put("weeklySchedule", schedule);
        response.put("recommendedExercises", exercises);

        return response;
    }

    /**
     * AI chatbot simulation utilizing database data-binding and NLP pattern recognition.
     */
    public Map<String, Object> chatbotQuery(String message, Integer userId) {
        String msg = message.toLowerCase().trim();
        StringBuilder reply = new StringBuilder();

        // 1. Matches & Schedule queries
        if (msg.contains("match") || msg.contains("schedule") || msg.contains("fixture") || msg.contains("play")) {
            List<Match> matches = matchRepository.findAll();
            List<Match> upcoming = matches.stream()
                    .filter(m -> m.getStatus() == Match.MatchStatus.Scheduled)
                    .limit(3)
                    .collect(Collectors.toList());

            if (upcoming.isEmpty()) {
                reply.append("There are no upcoming matches scheduled at the moment.");
            } else {
                reply.append("Here are the next scheduled matches:\n");
                for (Match m : upcoming) {
                    reply.append(String.format("• %s vs %s (%s) on %s at %s\n",
                            m.getTeam1().getName(), m.getTeam2().getName(),
                            m.getTournament().getName(), m.getMatchDate(), m.getMatchTime()));
                }
            }
        }
        // 2. Rules queries
        else if (msg.contains("rule") || msg.contains("how to play")) {
            List<Sport> sports = sportRepository.findAll();
            Optional<Sport> matchedSport = sports.stream()
                    .filter(s -> msg.contains(s.getName().toLowerCase()))
                    .findFirst();

            if (matchedSport.isPresent()) {
                Sport s = matchedSport.get();
                reply.append(String.format("Rules for **%s**:\n%s\n\n*Description: %s*",
                        s.getName(), s.getRules(), s.getDescription()));
            } else {
                reply.append("Which sport rules are you looking for? You can ask me 'rules of Cricket' or 'rules of Football'.");
            }
        }
        // 3. Tournament queries
        else if (msg.contains("tournament") || msg.contains("league") || msg.contains("cup")) {
            List<Tournament> tournaments = tournamentRepository.findAll();
            List<Tournament> active = tournaments.stream()
                    .filter(t -> t.getStatus() != Tournament.TournamentStatus.Completed)
                    .collect(Collectors.toList());

            if (active.isEmpty()) {
                reply.append("There are no active or upcoming tournaments right now. Check back later!");
            } else {
                reply.append("Current active & upcoming tournaments:\n");
                for (Tournament t : active) {
                    reply.append(String.format("• **%s** (%s) - Status: %s. Starts: %s\n",
                            t.getName(), t.getSport().getName(), t.getStatus(), t.getStartDate()));
                }
            }
        }
        // 4. Ground/Booking queries
        else if (msg.contains("book") || msg.contains("ground") || msg.contains("facility")) {
            reply.append("To book a sports facility or ground, follow these steps:\n")
                 .append("1. Navigate to the **Ground Bookings** tab on your dashboard.\n")
                 .append("2. Select the ground you want to reserve.\n")
                 .append("3. Pick the date, start time, and end time.\n")
                 .append("4. Click **Request Booking**. Your request will be queued for Admin approval!");
        }
        // 5. Personal performance queries
        else if (userId != null && (msg.contains("my performance") || msg.contains("my stat") || msg.contains("my score") || msg.contains("how am i doing"))) {
            List<PerformanceRecord> records = performanceRecordRepository.findByStudentId(userId);
            if (records.isEmpty()) {
                reply.append("You do not have any recorded match performance statistics yet. Participate in matches to record stats!");
            } else {
                reply.append("Your recent match performances:\n");
                for (PerformanceRecord r : records) {
                    reply.append(String.format("• Sport: %s, Score: %d/100, Feedback: %s (%s)\n",
                            r.getSport().getName(), r.getPerformanceScore(), r.getFeedback(), r.getRecordedDate()));
                }
            }
        }
        // Default persona
        else {
            reply.append("Hello! I am your College Sports AI Assistant. 🤖\n")
                 .append("You can ask me questions about:\n")
                 .append("• Upcoming matches & schedules (e.g. 'when is the next match?')\n")
                 .append("• Tournament details (e.g. 'show active tournaments')\n")
                 .append("• Sport rules (e.g. 'cricket rules')\n")
                 .append("• Facility bookings (e.g. 'how to book a ground?')\n")
                 .append("• Player statistics (e.g. 'show my performance')");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("reply", reply.toString());
        response.put("timestamp", LocalDate.now());
        return response;
    }
}
