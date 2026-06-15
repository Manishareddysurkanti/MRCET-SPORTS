package com.collegesports.repository;

import com.collegesports.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUserIdOrUserIsNullOrderByCreatedAtDesc(Integer userId);
    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
