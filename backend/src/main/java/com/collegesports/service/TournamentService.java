package com.collegesports.service;

import com.collegesports.model.*;
import com.collegesports.repository.MatchRepository;
import com.collegesports.repository.TeamRepository;
import com.collegesports.repository.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TournamentService {

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private TeamRepository teamRepository;

    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    public Tournament getTournamentById(Integer id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
    }

    @Transactional
    public Tournament createTournament(Tournament tournament) {
        tournament.setStatus(Tournament.TournamentStatus.Upcoming);
        return tournamentRepository.save(tournament);
    }

    @Transactional
    public List<Match> generateFixtures(Integer tournamentId) {
        Tournament tournament = getTournamentById(tournamentId);
        List<Team> teams = teamRepository.findBySportId(tournament.getSport().getId());

        if (teams.size() < 2) {
            throw new RuntimeException("Need at least 2 teams in this sport category to generate fixtures!");
        }

        // Clear existing matches for this tournament
        List<Match> existingMatches = matchRepository.findByTournamentId(tournamentId);
        matchRepository.deleteAll(existingMatches);

        List<Match> matches = new ArrayList<>();
        LocalDate matchDate = tournament.getStartDate();
        LocalTime matchTime = LocalTime.of(10, 0); // Default 10:00 AM

        // Generate round-robin match fixtures
        for (int i = 0; i < teams.size(); i++) {
            for (int j = i + 1; j < teams.size(); j++) {
                Team team1 = teams.get(i);
                Team team2 = teams.get(j);

                Match match = new Match(
                        tournament,
                        team1,
                        team2,
                        matchDate,
                        matchTime,
                        Match.MatchStatus.Scheduled,
                        "Round Robin"
                );
                matches.add(matchRepository.save(match));

                // Alternate dates and times slightly
                matchDate = matchDate.plusDays(1);
                if (matchDate.isAfter(tournament.getEndDate())) {
                    matchDate = tournament.getStartDate(); // wrap around
                }
            }
        }

        tournament.setStatus(Tournament.TournamentStatus.Active);
        tournamentRepository.save(tournament);

        return matches;
    }

    @Transactional
    public Match updateMatchScore(Integer matchId, Integer score1, Integer score2, Integer winnerTeamId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        match.setScoreTeam1(score1);
        match.setScoreTeam2(score2);

        if (winnerTeamId != null) {
            Team winner = teamRepository.findById(winnerTeamId)
                    .orElseThrow(() -> new RuntimeException("Winner team not found"));
            match.setWinner(winner);
            match.setStatus(Match.MatchStatus.Completed);
        } else {
            match.setWinner(null);
            match.setStatus(Match.MatchStatus.Live);
        }

        return matchRepository.save(match);
    }

    public List<Map<String, Object>> getPointsTable(Integer tournamentId) {
        Tournament tournament = getTournamentById(tournamentId);
        List<Match> matches = matchRepository.findByTournamentId(tournamentId);
        List<Team> teams = teamRepository.findBySportId(tournament.getSport().getId());

        Map<Integer, Map<String, Object>> table = new HashMap<>();

        // Initialize table rows
        for (Team team : teams) {
            Map<String, Object> row = new HashMap<>();
            row.put("teamId", team.getId());
            row.put("teamName", team.getName());
            row.put("played", 0);
            row.put("won", 0);
            row.put("lost", 0);
            row.put("points", 0);
            table.put(team.getId(), row);
        }

        // Process completed matches to update table
        for (Match match : matches) {
            if (match.getStatus() == Match.MatchStatus.Completed && match.getWinner() != null) {
                Integer wId = match.getWinner().getId();
                Integer lId = match.getTeam1().getId().equals(wId) ? match.getTeam2().getId() : match.getTeam1().getId();

                if (table.containsKey(wId)) {
                    Map<String, Object> wRow = table.get(wId);
                    wRow.put("played", (int) wRow.get("played") + 1);
                    wRow.put("won", (int) wRow.get("won") + 1);
                    wRow.put("points", (int) wRow.get("points") + 2); // 2 Points for a Win
                }

                if (table.containsKey(lId)) {
                    Map<String, Object> lRow = table.get(lId);
                    lRow.put("played", (int) lRow.get("played") + 1);
                    lRow.put("lost", (int) lRow.get("lost") + 1);
                }
            }
        }

        // Sort table list by points descending
        List<Map<String, Object>> sortedTable = new ArrayList<>(table.values());
        sortedTable.sort((r1, r2) -> Integer.compare((int) r2.get("points"), (int) r1.get("points")));

        return sortedTable;
    }

    @Transactional
    public Tournament declareWinner(Integer tournamentId, Integer winnerTeamId) {
        Tournament tournament = getTournamentById(tournamentId);
        Team winner = teamRepository.findById(winnerTeamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        tournament.setWinnerTeam(winner);
        tournament.setStatus(Tournament.TournamentStatus.Completed);
        return tournamentRepository.save(tournament);
    }
}
