package com.collegesports.model;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @ManyToOne(optional = false)
    @JoinColumn(name = "coach_id", nullable = false)
    private User coach;

    @ManyToOne(optional = false)
    @JoinColumn(name = "captain_id", nullable = false)
    private User captain;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "team_players",
        joinColumns = @JoinColumn(name = "team_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private Set<User> players;

    // Constructors
    public Team() {}

    public Team(String name, Sport sport, User coach, User captain, Set<User> players) {
        this.name = name;
        this.sport = sport;
        this.coach = coach;
        this.captain = captain;
        this.players = players;
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

    public User getCoach() {
        return coach;
    }

    public void setCoach(User coach) {
        this.coach = coach;
    }

    public User getCaptain() {
        return captain;
    }

    public void setCaptain(User captain) {
        this.captain = captain;
    }

    public Set<User> getPlayers() {
        return players;
    }

    public void setPlayers(Set<User> players) {
        this.players = players;
    }
}
