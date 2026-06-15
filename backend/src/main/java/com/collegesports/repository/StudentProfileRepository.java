package com.collegesports.repository;

import com.collegesports.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Integer> {
    Optional<StudentProfile> findByUserId(Integer userId);
    Optional<StudentProfile> findByRollNo(String rollNo);
}
