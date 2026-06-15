package com.collegesports.controller;

import com.collegesports.model.Tournament;
import com.collegesports.service.TournamentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    @Autowired
    private TournamentService tournamentService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(tournamentService.getAllTournaments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(tournamentService.getTournamentById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Tournament tournament) {
        try {
            return ResponseEntity.ok(tournamentService.createTournament(tournament));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/fixtures/{tournamentId}")
    public ResponseEntity<?> generateFixtures(@PathVariable Integer tournamentId) {
        try {
            return ResponseEntity.ok(tournamentService.generateFixtures(tournamentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/match/{matchId}/score")
    public ResponseEntity<?> updateScore(@PathVariable Integer matchId, @RequestBody Map<String, Object> payload) {
        try {
            Integer score1 = Integer.parseInt(payload.get("scoreTeam1").toString());
            Integer score2 = Integer.parseInt(payload.get("scoreTeam2").toString());
            
            Integer winnerTeamId = null;
            if (payload.get("winnerTeamId") != null && !payload.get("winnerTeamId").toString().isEmpty()) {
                winnerTeamId = Integer.parseInt(payload.get("winnerTeamId").toString());
            }

            return ResponseEntity.ok(tournamentService.updateMatchScore(matchId, score1, score2, winnerTeamId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/points-table/{tournamentId}")
    public ResponseEntity<?> getPointsTable(@PathVariable Integer tournamentId) {
        try {
            return ResponseEntity.ok(tournamentService.getPointsTable(tournamentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{tournamentId}/winner")
    public ResponseEntity<?> declareWinner(@PathVariable Integer tournamentId, @RequestBody Map<String, Integer> payload) {
        try {
            Integer winnerTeamId = payload.get("winnerTeamId");
            return ResponseEntity.ok(tournamentService.declareWinner(tournamentId, winnerTeamId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
