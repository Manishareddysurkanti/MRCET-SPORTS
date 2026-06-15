package com.collegesports.repository;

import com.collegesports.model.PerformanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PerformanceRecordRepository extends JpaRepository<PerformanceRecord, Integer> {
    List<PerformanceRecord> findByStudentId(Integer studentId);
    List<PerformanceRecord> findBySportId(Integer sportId);
    List<PerformanceRecord> findByStudentIdAndSportId(Integer studentId, Integer sportId);
}
