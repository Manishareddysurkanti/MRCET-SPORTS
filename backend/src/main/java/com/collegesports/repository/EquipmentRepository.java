package com.collegesports.repository;

import com.collegesports.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Integer> {
    List<Equipment> findBySportId(Integer sportId);
}
