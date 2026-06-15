package com.collegesports.config;

import com.collegesports.model.*;
import com.collegesports.repository.*;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CoachProfileRepository coachProfileRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private GroundRepository groundRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PerformanceRecordRepository performanceRecordRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("Running self-healing database seeder...");

        // 1. Create or Update Users with guaranteed password
        String pwHash = BCrypt.hashpw("password123", BCrypt.gensalt());
        
        User admin = updateOrCreateUser("System Admin", "admin@sports.college.edu", pwHash, User.Role.ADMIN);
        User coachVikram = updateOrCreateUser("Coach Vikram Rathore", "vikram.coach@sports.college.edu", pwHash, User.Role.COACH);
        User coachSarah = updateOrCreateUser("Coach Sarah Dsouza", "sarah.coach@sports.college.edu", pwHash, User.Role.COACH);
        
        User studentAarav = updateOrCreateUser("Aarav Sharma", "aarav.sharma@student.edu", pwHash, User.Role.STUDENT);
        User studentAditya = updateOrCreateUser("Aditya Patel", "aditya.patel@student.edu", pwHash, User.Role.STUDENT);
        User studentRiya = updateOrCreateUser("Riya Sen", "riya.sen@student.edu", pwHash, User.Role.STUDENT);
        User studentVihaan = updateOrCreateUser("Vihaan Reddy", "vihaan.reddy@student.edu", pwHash, User.Role.STUDENT);
        User studentDiya = updateOrCreateUser("Diya Iyer", "diya.iyer@student.edu", pwHash, User.Role.STUDENT);
        User studentRahul = updateOrCreateUser("Rahul Kumar", "rahul.kumar@student.edu", pwHash, User.Role.STUDENT);

        // 2. Create Student Profiles if not exist
        createStudentProfileIfNotExist(studentAarav, "CS23B1042", "Computer Science & Engineering", 3, "9876543210", "Best Bowler - Inter-College Cup 2025");
        createStudentProfileIfNotExist(studentAditya, "EE24B1102", "Electrical Engineering", 2, "8765432109", "Captain of Department Basketball Team");
        createStudentProfileIfNotExist(studentRiya, "ME22B1089", "Mechanical Engineering", 4, "7654321098", "Runner-up in District Badminton Singles 2024");
        createStudentProfileIfNotExist(studentVihaan, "CE25B1011", "Civil Engineering", 1, "6543210987", "State-level Under-19 Football Midfielder");
        createStudentProfileIfNotExist(studentDiya, "EC23B1005", "Electronics & Comm. Engineering", 3, "5432109876", "MVP - Spring Fest Tournament 2026");
        createStudentProfileIfNotExist(studentRahul, "CS24B1055", "Computer Science & Engineering", 2, "9988776655", "None");

        // 3. Create Sports Categories if not exist
        Sport cricket = getOrCreateSport("Cricket", Sport.SportType.TEAM, "Traditional 11-a-side outdoor pitch sport.", "Standard ICC rules apply. Matches are 20 Overs.");
        Sport basketball = getOrCreateSport("Basketball", Sport.SportType.TEAM, "Indoor/Outdoor 5-a-side court game.", "Standard FIBA rules. 4 Quarters of 10 minutes each.");
        Sport football = getOrCreateSport("Football", Sport.SportType.TEAM, "Outdoor 11-a-side stadium game.", "FIFA rules. 2 Halves of 45 minutes each.");

        // 4. Create Coach Profiles if not exist
        createCoachProfileIfNotExist(coachVikram, cricket, 8, "9123456789");
        createCoachProfileIfNotExist(coachSarah, football, 5, "9234567890");

        // 5. Create Teams if not exist
        if (teamRepository.count() == 0) {
            Set<User> cseMavsPlayers = new HashSet<>(Arrays.asList(studentAarav, studentAditya, studentRahul));
            Set<User> eceWarriorsPlayers = new HashSet<>(Arrays.asList(studentRiya, studentDiya));
            Set<User> eeGiantsPlayers = new HashSet<>(Arrays.asList(studentAditya, studentDiya));
            Set<User> civilKnightsPlayers = new HashSet<>(Arrays.asList(studentVihaan, studentRiya));

            Team cseMavs = new Team("CSE Mavericks", cricket, coachVikram, studentAarav, cseMavsPlayers);
            Team eceWarriors = new Team("ECE Warriors", cricket, coachVikram, studentRiya, eceWarriorsPlayers);
            Team eeGiants = new Team("EE Giants", basketball, admin, studentAditya, eeGiantsPlayers);
            Team civilKnights = new Team("Civil Knights", football, coachSarah, studentVihaan, civilKnightsPlayers);

            teamRepository.saveAll(Arrays.asList(cseMavs, eceWarriors, eeGiants, civilKnights));

            // Create Tournaments
            Tournament t1 = new Tournament("Inter-Department Cricket Cup 2026", cricket, LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 20), Tournament.TournamentStatus.Active, Tournament.TournamentType.ROUND_ROBIN);
            Tournament t2 = new Tournament("Monsoon Basketball League", basketball, LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 10), Tournament.TournamentStatus.Upcoming, Tournament.TournamentType.ROUND_ROBIN);
            Tournament t3 = new Tournament("Annual Football Tournament 2026", football, LocalDate.of(2026, 5, 15), LocalDate.of(2026, 5, 25), Tournament.TournamentStatus.Completed, Tournament.TournamentType.KNOCKOUT);
            t3.setWinnerTeam(civilKnights);
            tournamentRepository.saveAll(Arrays.asList(t1, t2, t3));

            // Create Matches
            Match m1 = new Match(t1, cseMavs, eceWarriors, LocalDate.of(2026, 6, 12), LocalTime.of(14, 30), Match.MatchStatus.Completed, "Group Stage");
            m1.setScoreTeam1(145);
            m1.setScoreTeam2(142);
            m1.setWinner(cseMavs);

            Match m2 = new Match(t1, cseMavs, eceWarriors, LocalDate.of(2026, 6, 16), LocalTime.of(9, 0), Match.MatchStatus.Scheduled, "Finals");
            
            Match m3 = new Match(t3, civilKnights, cseMavs, LocalDate.of(2026, 5, 20), LocalTime.of(16, 0), Match.MatchStatus.Completed, "Finals");
            m3.setScoreTeam1(3);
            m3.setScoreTeam2(1);
            m3.setWinner(civilKnights);

            matchRepository.saveAll(Arrays.asList(m1, m2, m3));

            // Create Grounds
            Ground g1 = new Ground("Main Cricket Ground", "East Campus Sports Complex", Ground.GroundStatus.Available, "https://images.unsplash.com/photo-1589801258579-18e0ae1d7ad5?w=500&h=300&fit=crop");
            Ground g2 = new Ground("Indoor Basketball Arena", "Gymnasium Block C", Ground.GroundStatus.Available, "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=500&h=300&fit=crop");
            Ground g3 = new Ground("Soccer Stadium", "West Campus field", Ground.GroundStatus.Available, "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&h=300&fit=crop");
            groundRepository.saveAll(Arrays.asList(g1, g2, g3));

            // Bookings
            bookingRepository.save(new Booking(g1, studentAarav, LocalDate.of(2026, 6, 14), LocalTime.of(15, 0), LocalTime.of(18, 0), "Team Nets Practice", Booking.BookingStatus.Approved));
            bookingRepository.save(new Booking(g2, studentAditya, LocalDate.of(2026, 6, 17), LocalTime.of(17, 0), LocalTime.of(19, 0), "Recreational play", Booking.BookingStatus.Pending));
            bookingRepository.save(new Booking(g3, coachVikram, LocalDate.of(2026, 6, 18), LocalTime.of(7, 0), LocalTime.of(9, 30), "Cricket Conditioning Camp", Booking.BookingStatus.Approved));

            // Equipment Inventory
            equipmentRepository.save(new Equipment("Cricket Leather Bats", cricket, 10, 8));
            equipmentRepository.save(new Equipment("Cricket Leather Balls", cricket, 50, 45));
            equipmentRepository.save(new Equipment("Spalding Basketballs", basketball, 15, 12));
            equipmentRepository.save(new Equipment("Nike Soccer Balls", football, 20, 17));
            equipmentRepository.save(new Equipment("Training Cones", football, 100, 100));

            // Attendance
            attendanceRepository.save(new Attendance(cseMavs, studentAarav, LocalDate.of(2026, 6, 14), Attendance.AttendanceStatus.Present));
            attendanceRepository.save(new Attendance(cseMavs, studentAditya, LocalDate.of(2026, 6, 14), Attendance.AttendanceStatus.Present));
            attendanceRepository.save(new Attendance(cseMavs, studentRahul, LocalDate.of(2026, 6, 14), Attendance.AttendanceStatus.Absent));
            attendanceRepository.save(new Attendance(civilKnights, studentVihaan, LocalDate.of(2026, 6, 13), Attendance.AttendanceStatus.Present));
            attendanceRepository.save(new Attendance(civilKnights, studentRiya, LocalDate.of(2026, 6, 13), Attendance.AttendanceStatus.Present));

            // Performance Records
            performanceRecordRepository.save(new PerformanceRecord(studentAarav, cricket, m1, 85, "{\"runs\": 68, \"wickets\": 1}", "Excellent batting under pressure, stable bowling in death overs.", LocalDate.of(2026, 6, 12)));
            performanceRecordRepository.save(new PerformanceRecord(studentRiya, cricket, m1, 72, "{\"runs\": 42, \"wickets\": 0}", "Played a decent inning but struggled against spin.", LocalDate.of(2026, 6, 12)));
            performanceRecordRepository.save(new PerformanceRecord(studentVihaan, football, m3, 90, "{\"goals\": 2, \"assists\": 1}", "Man of the Match. Decisive runs and brilliant assists.", LocalDate.of(2026, 5, 20)));

            // Notifications
            notificationRepository.save(new Notification("College Sports Portal Online", "Welcome to the new College Sports Management Portal. You can register for tournaments, book grounds, and view live scores.", null, false));
            notificationRepository.save(new Notification("Cricket Tournament Matches Announced", "Matches for Inter-Department Cricket Cup 2026 have been generated. Check the schedule.", null, false));
            notificationRepository.save(new Notification("Ground Booking Confirmed", "Your request to book the Main Cricket Ground on 2026-06-14 has been Approved.", studentAarav, false));
        }

        System.out.println("✅ Self-healing database seeding completed successfully!");
    }

    private User updateOrCreateUser(String name, String email, String pwHash, User.Role role) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            user.setName(name);
            user.setPassword(pwHash);
            user.setRole(role);
        } else {
            user = new User(name, email, pwHash, role);
        }
        return userRepository.save(user);
    }

    private void createStudentProfileIfNotExist(User user, String rollNo, String dept, Integer year, String contact, String achievements) {
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(user.getId());
        if (profileOpt.isEmpty()) {
            studentProfileRepository.save(new StudentProfile(user, rollNo, dept, year, contact, achievements));
        }
    }

    private void createCoachProfileIfNotExist(User user, Sport sport, Integer experience, String contact) {
        Optional<CoachProfile> profileOpt = coachProfileRepository.findByUserId(user.getId());
        if (profileOpt.isEmpty()) {
            coachProfileRepository.save(new CoachProfile(user, sport, experience, contact));
        }
    }

    private Sport getOrCreateSport(String name, Sport.SportType type, String description, String rules) {
        Optional<Sport> sportOpt = sportRepository.findByName(name);
        if (sportOpt.isPresent()) {
            return sportOpt.get();
        }
        return sportRepository.save(new Sport(name, type, description, rules));
    }
}
