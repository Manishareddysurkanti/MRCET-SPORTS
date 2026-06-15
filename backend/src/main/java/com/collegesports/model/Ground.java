package com.collegesports.model;

import jakarta.persistence.*;

@Entity
@Table(name = "grounds")
public class Ground {

    public enum GroundStatus {
        Available, Maintenance
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroundStatus status = GroundStatus.Available;

    @Column(name = "image_url", length = 2083)
    private String imageUrl;

    // Constructors
    public Ground() {}

    public Ground(String name, String location, GroundStatus status, String imageUrl) {
        this.name = name;
        this.location = location;
        this.status = status;
        this.imageUrl = imageUrl;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public GroundStatus getStatus() {
        return status;
    }

    public void setStatus(GroundStatus status) {
        this.status = status;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
