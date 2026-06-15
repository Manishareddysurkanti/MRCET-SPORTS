package com.collegesports.service;

import com.collegesports.model.*;
import com.collegesports.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CoachProfileRepository coachProfileRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GroundRepository groundRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    public Map<String, Object> getDashboardStats() {
        long totalStudents = userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.STUDENT).count();
        long totalCoaches = userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.COACH).count();
        long totalSports = sportRepository.count();
        long totalTournaments = tournamentRepository.count();
        long activeTournaments = tournamentRepository.findAll().stream().filter(t -> t.getStatus() == Tournament.TournamentStatus.Active).count();
        long pendingBookings = bookingRepository.findAll().stream().filter(b -> b.getStatus() == Booking.BookingStatus.Pending).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("totalCoaches", totalCoaches);
        stats.put("totalSports", totalSports);
        stats.put("totalTournaments", totalTournaments);
        stats.put("activeTournaments", activeTournaments);
        stats.put("pendingBookings", pendingBookings);

        return stats;
    }

    public List<StudentProfile> getAllStudents() {
        return studentProfileRepository.findAll();
    }

    public List<CoachProfile> getAllCoaches() {
        return coachProfileRepository.findAll();
    }

    public List<Sport> getAllSports() {
        return sportRepository.findAll();
    }

    public Sport saveSport(Sport sport) {
        return sportRepository.save(sport);
    }

    public void deleteSport(Integer id) {
        sportRepository.deleteById(id);
    }

    public List<Ground> getAllGrounds() {
        return groundRepository.findAll();
    }

    public Ground saveGround(Ground ground) {
        return groundRepository.save(ground);
    }

    public void deleteGround(Integer id) {
        groundRepository.deleteById(id);
    }

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Equipment saveEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    public void deleteEquipment(Integer id) {
        equipmentRepository.deleteById(id);
    }
}
