package com.collegesports.service;

import com.collegesports.model.*;
import com.collegesports.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private PerformanceRecordRepository performanceRecordRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    public String generateParticipationReportCSV() {
        List<StudentProfile> students = studentProfileRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Student ID,Name,Email,Roll Number,Department,Year,Contact,Achievements\n");
        for (StudentProfile sp : students) {
            csv.append(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",\"%s\"\n",
                    sp.getUser().getId(),
                    sp.getUser().getName().replace("\"", "\"\""),
                    sp.getUser().getEmail().replace("\"", "\"\""),
                    sp.getRollNo(),
                    sp.getDept().replace("\"", "\"\""),
                    sp.getYear(),
                    sp.getContact() != null ? sp.getContact() : "",
                    sp.getAchievements() != null ? sp.getAchievements().replace("\n", " ").replace("\"", "\"\"") : ""
            ));
        }
        return csv.toString();
    }

    public String generateTournamentReportCSV(Integer tournamentId) {
        Tournament t = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        List<Match> matches = matchRepository.findByTournamentId(tournamentId);

        StringBuilder csv = new StringBuilder();
        csv.append(String.format("Tournament Report: %s (%s)\n", t.getName(), t.getSport().getName()));
        csv.append(String.format("Start Date: %s, End Date: %s, Status: %s\n\n", t.getStartDate(), t.getEndDate(), t.getStatus()));
        csv.append("Match ID,Round,Team 1,Team 2,Date,Time,Status,Score Team 1,Score Team 2,Winner\n");

        for (Match m : matches) {
            csv.append(String.format("%d,\"%s\",\"%s\",\"%s\",%s,%s,\"%s\",%d,%d,\"%s\"\n",
                    m.getId(),
                    m.getRound(),
                    m.getTeam1().getName(),
                    m.getTeam2().getName(),
                    m.getMatchDate(),
                    m.getMatchTime(),
                    m.getStatus().name(),
                    m.getScoreTeam1(),
                    m.getScoreTeam2(),
                    m.getWinner() != null ? m.getWinner().getName() : "Draw/TBD"
            ));
        }
        return csv.toString();
    }

    public String generatePlayerPerformanceReportCSV(Integer studentId) {
        List<PerformanceRecord> records = performanceRecordRepository.findByStudentId(studentId);
        StringBuilder csv = new StringBuilder();
        csv.append("Record ID,Sport,Date,Performance Score (1-100),Feedback,Match Details\n");
        for (PerformanceRecord pr : records) {
            String matchInfo = pr.getMatch() != null ? 
                    pr.getMatch().getTeam1().getName() + " vs " + pr.getMatch().getTeam2().getName() : "Practice/General";
            csv.append(String.format("%d,\"%s\",%s,%d,\"%s\",\"%s\"\n",
                    pr.getId(),
                    pr.getSport().getName(),
                    pr.getRecordedDate(),
                    pr.getPerformanceScore(),
                    pr.getFeedback() != null ? pr.getFeedback().replace("\n", " ").replace("\"", "\"\"") : "",
                    matchInfo
            ));
        }
        return csv.toString();
    }

    public String generateAttendanceReportCSV(Integer teamId) {
        List<Attendance> attendances = attendanceRepository.findByTeamId(teamId);
        StringBuilder csv = new StringBuilder();
        csv.append("Attendance ID,Student Name,Roll No,Date,Status\n");
        for (Attendance a : attendances) {
            Optional<StudentProfile> spOpt = studentProfileRepository.findByUserId(a.getStudent().getId());
            String rollNo = spOpt.isPresent() ? spOpt.get().getRollNo() : "N/A";
            csv.append(String.format("%d,\"%s\",\"%s\",%s,\"%s\"\n",
                    a.getId(),
                    a.getStudent().getName(),
                    rollNo,
                    a.getAttendanceDate(),
                    a.getStatus().name()
            ));
        }
        return csv.toString();
    }
}
