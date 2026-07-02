USE college_sports_db;

-- Clear existing data (in reverse dependency order)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE matches;
TRUNCATE TABLE registrations;
TRUNCATE TABLE tournaments;
TRUNCATE TABLE team_players;
TRUNCATE TABLE teams;
TRUNCATE TABLE student_profiles;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users (Password is 'password123' bcrypt hash: $2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.)
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'System Admin', 'admin@sports.college.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'ADMIN'),
(2, 'Aarav Sharma', 'aarav.sharma@student.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'STUDENT'),
(3, 'Aditya Patel', 'aditya.patel@student.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'STUDENT'),
(4, 'Riya Sen', 'riya.sen@student.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'STUDENT'),
(5, 'Vihaan Reddy', 'vihaan.reddy@student.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'STUDENT'),
(6, 'Diya Iyer', 'diya.iyer@student.edu', '$2a$10$Xm5p0B5tT.l.i23hL5sXfOuE3B3n1vY4XqY.o792q3D4W/T9u/cK.', 'STUDENT');

-- 2. Insert Student Profiles
INSERT INTO student_profiles (user_id, roll_no, dept, year, sport_category, achievements, image_url) VALUES
(2, 'CS23B1042', 'Computer Science & Engineering', 3, 'Cricket', 'Best Bowler - Inter-College Cup 2025', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop'),
(3, 'EE24B1102', 'Electrical Engineering', 2, 'Basketball', 'Captain of Department Basketball Team', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'),
(4, 'ME22B1089', 'Mechanical Engineering', 4, 'Cricket', 'Runner-up in District Badminton Single 2024', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'),
(5, 'CE25B1011', 'Civil Engineering', 1, 'Football', 'State-level Under-19 Football Midfielder', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'),
(6, 'EC23B1005', 'Electronics & Comm. Engineering', 3, 'Basketball', 'MVP - Spring Fest Tournament 2026', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop');

-- 3. Insert Tournaments
INSERT INTO tournaments (id, name, sport_type, status) VALUES
(1, 'Inter-Department Cricket Cup 2026', 'Cricket', 'Active'),
(2, 'Monsoon Basketball League', 'Basketball', 'Upcoming'),
(3, 'Annual Football Tournament', 'Football', 'Completed');

-- 4. Insert Teams
INSERT INTO teams (id, name, captain_id, sport_type) VALUES
(1, 'CSE Mavericks', 2, 'Cricket'),
(2, 'ECE Warriors', 4, 'Cricket'),
(3, 'EE Giants', 3, 'Basketball'),
(4, 'ME Tigers', 6, 'Basketball'),
(5, 'Civil Knights', 5, 'Football');

-- 5. Insert Team Players
INSERT INTO team_players (team_id, student_id) VALUES
(1, 2), (1, 3), -- Aarav (captain) and Aditya in CSE Mavericks
(2, 4), (2, 5), -- Riya (captain) and Vihaan in ECE Warriors
(3, 3), (3, 6), -- Aditya (captain) and Diya in EE Giants
(4, 6), (4, 2), -- Diya (captain) and Aarav in ME Tigers
(5, 5), (5, 4); -- Vihaan (captain) and Riya in Civil Knights

-- 6. Insert Registrations for Tournaments
INSERT INTO registrations (student_id, tournament_id, status) VALUES
(2, 1, 'Approved'),
(3, 1, 'Approved'),
(4, 1, 'Approved'),
(5, 2, 'Approved'),
(6, 2, 'Pending'),
(2, 2, 'Pending'),
(3, 3, 'Approved'),
(5, 3, 'Approved');

-- 7. Insert Matches
INSERT INTO matches (id, tournament_id, team1_id, team2_id, match_date, match_time, status, score_team1, score_team2, winner_id) VALUES
(1, 1, 1, 2, '2026-06-10', '14:30:00', 'Completed', 145, 142, 1),
(2, 1, 1, 2, '2026-06-15', '09:00:00', 'Upcoming', 0, 0, NULL),
(3, 3, 5, 1, '2026-05-20', '16:00:00', 'Completed', 3, 1, 5),
(4, 2, 3, 4, '2026-06-18', '17:30:00', 'Upcoming', 0, 0, NULL);

-- 8. Insert Notifications
INSERT INTO notifications (title, message, user_id) VALUES
('Welcome to College Sports Portal', 'Welcome to the new College Sports Management Portal. You can now register for tournaments, view schedules, and track live scores.', NULL),
('Cricket Tournament Live Now!', 'The Inter-Department Cricket Cup 2026 matches have started. Check schedules and live scores.', NULL),
('Registration Approved', 'Your registration for the Inter-Department Cricket Cup 2026 has been approved by the Admin.', 2),
('Team Match Reminder', 'Reminder: Your match CSE Mavericks vs ECE Warriors is scheduled for 2026-06-15 at 09:00 AM.', 2);
