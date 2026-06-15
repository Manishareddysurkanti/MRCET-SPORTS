-- Create Database
CREATE DATABASE IF NOT EXISTS college_sports_db;
USE college_sports_db;

-- Disable foreign key checks for clean truncation/drops
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS performance_records;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS grounds;
DROP TABLE IF EXISTS team_players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS coach_profiles;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS sports;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (Admin, Student, Coach accounts)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STUDENT', 'COACH') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Student Profiles
CREATE TABLE student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    dept VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    contact VARCHAR(20) DEFAULT NULL,
    achievements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Sports Categories Table
CREATE TABLE sports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type ENUM('TEAM', 'INDIVIDUAL') NOT NULL,
    description TEXT,
    rules TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Coach Profiles
CREATE TABLE coach_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    sport_id INT NOT NULL,
    experience INT NOT NULL, -- in years
    contact VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Teams
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    sport_id INT NOT NULL,
    coach_id INT NOT NULL,
    captain_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
    FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Team Players
CREATE TABLE team_players (
    team_id INT NOT NULL,
    student_id INT NOT NULL,
    PRIMARY KEY (team_id, student_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tournaments
CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sport_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Upcoming', 'Active', 'Completed') NOT NULL DEFAULT 'Upcoming',
    type ENUM('KNOCKOUT', 'ROUND_ROBIN') NOT NULL DEFAULT 'ROUND_ROBIN',
    winner_team_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_team_id) REFERENCES teams(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Matches
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    team1_id INT NOT NULL,
    team2_id INT NOT NULL,
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    status ENUM('Scheduled', 'Live', 'Completed') NOT NULL DEFAULT 'Scheduled',
    score_team1 INT DEFAULT 0,
    score_team2 INT DEFAULT 0,
    winner_id INT DEFAULT NULL,
    round VARCHAR(50) DEFAULT 'Group Stage',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (team1_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (team2_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES teams(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Grounds and Facilities
CREATE TABLE grounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('Available', 'Maintenance') NOT NULL DEFAULT 'Available',
    image_url VARCHAR(2083) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bookings
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ground_id INT NOT NULL,
    user_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ground_id) REFERENCES grounds(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Equipment Inventory
CREATE TABLE equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sport_id INT NOT NULL,
    total_qty INT NOT NULL,
    available_qty INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Attendance Table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    student_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_daily_attendance (team_id, student_id, attendance_date),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Performance Records
CREATE TABLE performance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    sport_id INT NOT NULL,
    match_id INT DEFAULT NULL,
    performance_score INT NOT NULL, -- 1 to 100 rating
    stats_json JSON DEFAULT NULL,   -- e.g., {"runs": 45, "wickets": 2} or {"goals": 2}
    feedback TEXT,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    user_id INT DEFAULT NULL, -- NULL indicates broadcast
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- SEED DATA
-- ==========================================

-- 1. Insert Users (Password is 'password123' bcrypt hash: $2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.)
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'System Admin', 'admin@sports.college.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'ADMIN'),
(2, 'Coach Vikram Rathore', 'vikram.coach@sports.college.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'COACH'),
(3, 'Coach Sarah Dsouza', 'sarah.coach@sports.college.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'COACH'),
(4, 'Aarav Sharma', 'aarav.sharma@student.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'STUDENT'),
(5, 'Aditya Patel', 'aditya.patel@student.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'STUDENT'),
(6, 'Riya Sen', 'riya.sen@student.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'STUDENT'),
(7, 'Vihaan Reddy', 'vihaan.reddy@student.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'STUDENT'),
(8, 'Diya Iyer', 'diya.iyer@student.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'STUDENT'),
(9, 'Rahul Kumar', 'rahul.kumar@student.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'STUDENT');

-- 2. Insert Student Profiles
INSERT INTO student_profiles (user_id, roll_no, dept, year, contact, achievements) VALUES
(4, 'CS23B1042', 'Computer Science & Engineering', 3, '9876543210', 'Best Bowler - Inter-College Cup 2025'),
(5, 'EE24B1102', 'Electrical Engineering', 2, '8765432109', 'Captain of Department Basketball Team'),
(6, 'ME22B1089', 'Mechanical Engineering', 4, '7654321098', 'Runner-up in District Badminton Singles 2024'),
(7, 'CE25B1011', 'Civil Engineering', 1, '6543210987', 'State-level Under-19 Football Midfielder'),
(8, 'EC23B1005', 'Electronics & Comm. Engineering', 3, '5432109876', 'MVP - Spring Fest Tournament 2026'),
(9, 'CS24B1055', 'Computer Science & Engineering', 2, '9988776655', 'None');

-- 3. Insert Sports Categories
INSERT INTO sports (id, name, type, description, rules) VALUES
(1, 'Cricket', 'TEAM', 'Traditional 11-a-side outdoor pitch sport.', 'Standard ICC rules apply. Matches are 20 Overs.'),
(2, 'Basketball', 'TEAM', 'Indoor/Outdoor 5-a-side court game.', 'Standard FIBA rules. 4 Quarters of 10 minutes each.'),
(3, 'Football', 'TEAM', 'Outdoor 11-a-side stadium game.', 'FIFA rules. 2 Halves of 45 minutes each.');

-- 4. Insert Coach Profiles
INSERT INTO coach_profiles (user_id, sport_id, experience, contact) VALUES
(2, 1, 8, '9123456789'), -- Vikram coaches Cricket
(3, 3, 5, '9234567890'); -- Sarah coaches Football

-- 5. Insert Teams
INSERT INTO teams (id, name, sport_id, coach_id, captain_id) VALUES
(1, 'CSE Mavericks', 1, 2, 4), -- Cricket, Coach Vikram, Captain Aarav
(2, 'ECE Warriors', 1, 2, 6),  -- Cricket, Coach Vikram, Captain Riya
(3, 'EE Giants', 2, 1, 5),     -- Basketball, Coach Admin, Captain Aditya
(4, 'Civil Knights', 3, 3, 7); -- Football, Coach Sarah, Captain Vihaan

-- 6. Insert Team Players
INSERT INTO team_players (team_id, student_id) VALUES
(1, 4), (1, 5), (1, 9), -- CSE Mavericks players: Aarav, Aditya, Rahul
(2, 6), (2, 8),         -- ECE Warriors players: Riya, Diya
(3, 5), (3, 8),         -- EE Giants players: Aditya, Diya
(4, 7), (4, 6);         -- Civil Knights players: Vihaan, Riya

-- 7. Insert Tournaments
INSERT INTO tournaments (id, name, sport_id, start_date, end_date, status, type) VALUES
(1, 'Inter-Department Cricket Cup 2026', 1, '2026-06-10', '2026-06-20', 'Active', 'ROUND_ROBIN'),
(2, 'Monsoon Basketball League', 2, '2026-07-01', '2026-07-10', 'Upcoming', 'ROUND_ROBIN'),
(3, 'Annual Football Tournament 2026', 3, '2026-05-15', '2026-05-25', 'Completed', 'KNOCKOUT');

-- Update completed tournament winner
UPDATE tournaments SET winner_team_id = 4 WHERE id = 3;

-- 8. Insert Matches
INSERT INTO matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, score_team1, score_team2, winner_id, round) VALUES
(1, 1, 1, 2, '2026-06-12', '14:30:00', 'Completed', 145, 142, 1, 'Group Stage'), -- CSE Mavericks beat ECE Warriors
(2, 1, 1, 2, '2026-06-16', '09:00:00', 'Scheduled', 0, 0, NULL, 'Finals'),
(3, 3, 4, 1, '2026-05-20', '16:00:00', 'Completed', 3, 1, 4, 'Finals'); -- Civil Knights beat CSE Mavericks (as soccer match)

-- 9. Insert Grounds
INSERT INTO grounds (id, name, location, status, image_url) VALUES
(1, 'Main Cricket Ground', 'East Campus Sports Complex', 'Available', 'https://images.unsplash.com/photo-1589801258579-18e0ae1d7ad5?w=500&h=300&fit=crop'),
(2, 'Indoor Basketball Arena', 'Gymnasium Block C', 'Available', 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=500&h=300&fit=crop'),
(3, 'Soccer Stadium', 'West Campus field', 'Available', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&h=300&fit=crop');

-- 10. Insert Bookings
INSERT INTO bookings (ground_id, user_id, booking_date, start_time, end_time, purpose, status) VALUES
(1, 4, '2026-06-14', '15:00:00', '18:00:00', 'Team Nets Practice', 'Approved'),
(2, 5, '2026-06-17', '17:00:00', '19:00:00', 'Recreational play', 'Pending'),
(3, 2, '2026-06-18', '07:00:00', '09:30:00', 'Cricket Conditioning Camp', 'Approved');

-- 11. Insert Equipment
INSERT INTO equipment (name, sport_id, total_qty, available_qty) VALUES
('Cricket Leather Bats', 1, 10, 8),
('Cricket Leather Balls', 1, 50, 45),
('Spalding Basketballs', 2, 15, 12),
('Nike Soccer Balls', 3, 20, 17),
('Training Cones', 3, 100, 100);

-- 12. Insert Attendance
INSERT INTO attendance (team_id, student_id, attendance_date, status) VALUES
(1, 4, '2026-06-14', 'Present'),
(1, 5, '2026-06-14', 'Present'),
(1, 9, '2026-06-14', 'Absent'),
(4, 7, '2026-06-13', 'Present'),
(4, 6, '2026-06-13', 'Present');

-- 13. Insert Performance Records
INSERT INTO performance_records (student_id, sport_id, match_id, performance_score, stats_json, feedback, recorded_date) VALUES
(4, 1, 1, 85, '{"runs": 68, "wickets": 1}', 'Excellent batting under pressure, stable bowling in death overs.', '2026-06-12'),
(6, 1, 1, 72, '{"runs": 42, "wickets": 0}', 'Played a decent inning but struggled against spin.', '2026-06-12'),
(7, 3, 3, 90, '{"goals": 2, "assists": 1}', 'Man of the Match. Decisive runs and brilliant assists.', '2026-05-20');

-- 14. Insert Notifications
INSERT INTO notifications (title, message, user_id) VALUES
('College Sports Portal Online', 'Welcome to the new College Sports Management Portal. You can register for tournaments, book grounds, and view live scores.', NULL),
('Cricket Tournament Matches Announced', 'Matches for Inter-Department Cricket Cup 2026 have been generated. Check the schedule.', NULL),
('Ground Booking Confirmed', 'Your request to book the Main Cricket Ground on 2026-06-14 has been Approved.', 4);
