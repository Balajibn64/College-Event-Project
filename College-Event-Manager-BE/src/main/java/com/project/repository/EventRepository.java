package com.project.repository;

import com.project.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    List<Event> findByDepartment(String department);
    
    List<Event> findByDateAfter(LocalDate date);
    
    @Query("SELECT e FROM Event e WHERE e.title LIKE %:searchTerm% OR e.description LIKE %:searchTerm%")
    List<Event> findByTitleOrDescriptionContaining(@Param("searchTerm") String searchTerm);
    
    List<Event> findByCreatedById(Long createdById);
    
    @Query("SELECT e FROM Event e JOIN e.participants p WHERE p.id = :userId")
    List<Event> findEventsByParticipantId(@Param("userId") Long userId);
} 