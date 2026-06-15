package com.collegesports.model;

import jakarta.persistence.*;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "roll_no", nullable = false, unique = true)
    private String rollNo;

    @Column(nullable = false)
    private String dept;

    @Column(nullable = false)
    private Integer year;

    private String contact;

    @Column(columnDefinition = "TEXT")
    private String achievements;

    // Constructors
    public StudentProfile() {}

    public StudentProfile(User user, String rollNo, String dept, Integer year, String contact, String achievements) {
        this.user = user;
        this.rollNo = rollNo;
        this.dept = dept;
        this.year = year;
        this.contact = contact;
        this.achievements = achievements;
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

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getDept() {
        return dept;
    }

    public void setDept(String dept) {
        this.dept = dept;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getAchievements() {
        return achievements;
    }

    public void setAchievements(String achievements) {
        this.achievements = achievements;
    }
}
