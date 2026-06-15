package com.collegesports.repository;

import com.collegesports.model.CoachProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CoachProfileRepository extends JpaRepository<CoachProfile, Integer> {
    Optional<CoachProfile> findByUserId(Integer userId);
}
