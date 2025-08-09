package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.project.entity.EventManager;

@Repository
public interface EventManagerRepository extends JpaRepository<EventManager, Long> {
    EventManager findByUserId(Long userId);
} 