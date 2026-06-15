package com.collegesports.repository;

import com.collegesports.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament, Integer> {
    List<Tournament> findBySportId(Integer sportId);
}
