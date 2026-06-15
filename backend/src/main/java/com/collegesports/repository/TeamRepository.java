package com.collegesports.repository;

import com.collegesports.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Integer> {
    Optional<Team> findByName(String name);
    List<Team> findByCoachId(Integer coachId);
    List<Team> findBySportId(Integer sportId);
    List<Team> findByCaptainId(Integer captainId);
}
