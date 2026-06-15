package com.collegesports.repository;

import com.collegesports.model.Sport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SportRepository extends JpaRepository<Sport, Integer> {
    Optional<Sport> findByName(String name);
}
