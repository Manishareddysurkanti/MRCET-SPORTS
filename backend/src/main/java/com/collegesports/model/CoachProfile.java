package com.collegesports.model;

import jakarta.persistence.*;

@Entity
@Table(name = "coach_profiles")
public class CoachProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sport_id", referencedColumnName = "id", nullable = false)
    private Sport sport;

    @Column(nullable = false)
    private Integer experience;

    private String contact;

    // Constructors
    public CoachProfile() {}

    public CoachProfile(User user, Sport sport, Integer experience, String contact) {
        this.user = user;
        this.sport = sport;
        this.experience = experience;
        this.contact = contact;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Sport getSport() {
        return sport;
    }

    public void setSport(Sport sport) {
        this.sport = sport;
    }

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }
}
