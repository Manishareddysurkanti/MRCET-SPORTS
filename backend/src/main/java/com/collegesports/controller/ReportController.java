package com.collegesports.controller;

import com.collegesports.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/participation")
    public ResponseEntity<String> getParticipationReport() {
        String csv = reportService.generateParticipationReportCSV();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=participation_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<String> getTournamentReport(@PathVariable Integer tournamentId) {
        String csv = reportService.generateTournamentReportCSV(tournamentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tournament_report_" + tournamentId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/performance/{studentId}")
    public ResponseEntity<String> getPerformanceReport(@PathVariable Integer studentId) {
        String csv = reportService.generatePlayerPerformanceReportCSV(studentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=player_performance_report_" + studentId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/attendance/{teamId}")
    public ResponseEntity<String> getAttendanceReport(@PathVariable Integer teamId) {
        String csv = reportService.generateAttendanceReportCSV(teamId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report_team_" + teamId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
