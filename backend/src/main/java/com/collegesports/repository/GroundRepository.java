package com.collegesports.repository;

import com.collegesports.model.Ground;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GroundRepository extends JpaRepository<Ground, Integer> {
    Optional<Ground> findByName(String name);
}
