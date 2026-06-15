package com.collegesports.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tournaments")
public class Tournament {

    public enum TournamentStatus {
        Upcoming, Active, Completed
    }

    public enum TournamentType {
        KNOCKOUT, ROUND_ROBIN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TournamentStatus status = TournamentStatus.Upcoming;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TournamentType type = TournamentType.ROUND_ROBIN;

    @ManyToOne
    @JoinColumn(name = "winner_team_id")
    private Team winnerTeam;

    // Constructors
    public Tournament() {}

    public Tournament(String name, Sport sport, LocalDate startDate, LocalDate endDate, TournamentStatus status, TournamentType type) {
        this.name = name;
        this.sport = sport;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.type = type;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Sport getSport() {
        return sport;
    }

    public void setSport(Sport sport) {
        this.sport = sport;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public TournamentStatus getStatus() {
        return status;
    }

    public void setStatus(TournamentStatus status) {
        this.status = status;
    }

    public TournamentType getType() {
        return type;
    }

    public void setType(TournamentType type) {
        this.type = type;
    }

    public Team getWinnerTeam() {
        return winnerTeam;
    }

    public void setWinnerTeam(Team winnerTeam) {
        this.winnerTeam = winnerTeam;
    }
}
