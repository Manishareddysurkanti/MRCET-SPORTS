package com.collegesports.repository;

import com.collegesports.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Integer> {
    List<Match> findByTournamentId(Integer tournamentId);
    List<Match> findByTeam1IdOrTeam2Id(Integer team1Id, Integer team2Id);
}
