package com.collegesports.service;

import com.collegesports.model.CoachProfile;
import com.collegesports.model.StudentProfile;
import com.collegesports.model.User;
import com.collegesports.repository.CoachProfileRepository;
import com.collegesports.repository.StudentProfileRepository;
import com.collegesports.repository.UserRepository;
import com.collegesports.security.JwtUtil;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CoachProfileRepository coachProfileRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, Object> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with email: " + email);
        }

        User user = userOpt.get();
        if (!BCrypt.checkpw(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials!");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());

        return response;
    }

    @Transactional
    public User registerStudent(User user, String rollNo, String dept, Integer year, String contact) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already in use!");
        }

        user.setPassword(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt()));
        user.setRole(User.Role.STUDENT);
        User savedUser = userRepository.save(user);

        StudentProfile profile = new StudentProfile(savedUser, rollNo, dept, year, contact, "None");
        studentProfileRepository.save(profile);

        return savedUser;
    }

    @Transactional
    public User registerCoach(User user, com.collegesports.model.Sport sport, Integer experience, String contact) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already in use!");
        }

        user.setPassword(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt()));
        user.setRole(User.Role.COACH);
        User savedUser = userRepository.save(user);

        CoachProfile profile = new CoachProfile(savedUser, sport, experience, contact);
        coachProfileRepository.save(profile);

        return savedUser;
    }

    public User getUserById(Integer id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
