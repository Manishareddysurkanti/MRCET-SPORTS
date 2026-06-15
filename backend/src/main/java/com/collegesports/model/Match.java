package com.collegesports.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "matches")
public class Match {

    public enum MatchStatus {
        Scheduled, Live, Completed
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team1_id", nullable = false)
    private Team team1;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team2_id", nullable = false)
    private Team team2;

    @Column(name = "match_date", nullable = false)
    private LocalDate matchDate;

    @Column(name = "match_time", nullable = false)
    private LocalTime matchTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status = MatchStatus.Scheduled;

    @Column(name = "score_team1")
    private Integer scoreTeam1 = 0;

    @Column(name = "score_team2")
    private Integer scoreTeam2 = 0;

    @ManyToOne
    @JoinColumn(name = "winner_id")
    private Team winner;

    private String round = "Group Stage";

    // Constructors
    public Match() {}

    public Match(Tournament tournament, Team team1, Team team2, LocalDate matchDate, LocalTime matchTime, MatchStatus status, String round) {
        this.tournament = tournament;
        this.team1 = team1;
        this.team2 = team2;
        this.matchDate = matchDate;
        this.matchTime = matchTime;
        this.status = status;
        this.round = round;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Tournament getTournament() {
        return tournament;
    }

    public void setTournament(Tournament tournament) {
        this.tournament = tournament;
    }

    public Team getTeam1() {
        return team1;
    }

    public void setTeam1(Team team1) {
        this.team1 = team1;
    }

    public Team getTeam2() {
        return team2;
    }

    public void setTeam2(Team team2) {
        this.team2 = team2;
    }

    public LocalDate getMatchDate() {
        return matchDate;
    }

    public void setMatchDate(LocalDate matchDate) {
        this.matchDate = matchDate;
    }

    public LocalTime getMatchTime() {
        return matchTime;
    }

    public void setMatchTime(LocalTime matchTime) {
        this.matchTime = matchTime;
    }

    public MatchStatus getStatus() {
        return status;
    }

    public void setStatus(MatchStatus status) {
        this.status = status;
    }

    public Integer getScoreTeam1() {
        return scoreTeam1;
    }

    public void setScoreTeam1(Integer scoreTeam1) {
        this.scoreTeam1 = scoreTeam1;
    }

    public Integer getScoreTeam2() {
        return scoreTeam2;
    }

    public void setScoreTeam2(Integer scoreTeam2) {
        this.scoreTeam2 = scoreTeam2;
    }

    public Team getWinner() {
        return winner;
    }

    public void setWinner(Team winner) {
        this.winner = winner;
    }

    public String getRound() {
        return round;
    }

    public void setRound(String round) {
        this.round = round;
    }
}
