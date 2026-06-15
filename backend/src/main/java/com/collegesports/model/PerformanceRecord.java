package com.collegesports.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "performance_records")
public class PerformanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @ManyToOne
    @JoinColumn(name = "match_id")
    private Match match;

    @Column(name = "performance_score", nullable = false)
    private Integer performanceScore;

    @Column(name = "stats_json", columnDefinition = "JSON")
    private String statsJson; // Represents custom performance stats e.g. {"runs": 40}

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    // Constructors
    public PerformanceRecord() {}

    public PerformanceRecord(User student, Sport sport, Match match, Integer performanceScore, String statsJson, String feedback, LocalDate recordedDate) {
        this.student = student;
        this.sport = sport;
        this.match = match;
        this.performanceScore = performanceScore;
        this.statsJson = statsJson;
        this.feedback = feedback;
        this.recordedDate = recordedDate;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Sport getSport() {
        return sport;
    }

    public void setSport(Sport sport) {
        this.sport = sport;
    }

    public Match getMatch() {
        return match;
    }

    public void setMatch(Match match) {
        this.match = match;
    }

    public Integer getPerformanceScore() {
        return performanceScore;
    }

    public void setPerformanceScore(Integer performanceScore) {
        this.performanceScore = performanceScore;
    }

    public String getStatsJson() {
        return statsJson;
    }

    public void setStatsJson(String statsJson) {
        this.statsJson = statsJson;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public LocalDate getRecordedDate() {
        return recordedDate;
    }

    public void setRecordedDate(LocalDate recordedDate) {
        this.recordedDate = recordedDate;
    }
}
