package com.collegesports.repository;

import com.collegesports.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByTeamId(Integer teamId);
    List<Attendance> findByStudentId(Integer studentId);
    List<Attendance> findByTeamIdAndAttendanceDate(Integer teamId, LocalDate attendanceDate);
    Optional<Attendance> findByTeamIdAndStudentIdAndAttendanceDate(Integer teamId, Integer studentId, LocalDate attendanceDate);
}
