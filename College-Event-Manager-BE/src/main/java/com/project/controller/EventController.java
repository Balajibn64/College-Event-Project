package com.project.controller;

import com.project.dto.CreateEventRequest;
import com.project.dto.EventDto;
import com.project.entity.User;
import com.project.service.EventService;
import com.project.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;
    private final UserService userService;

    public EventController(EventService eventService, UserService userService) {
        this.eventService = eventService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents() {
        List<EventDto> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        EventDto event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @PostMapping
    public ResponseEntity<EventDto> createEvent(@RequestBody CreateEventRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userService.findByEmail(userEmail);
        
        EventDto createdEvent = eventService.createEvent(request, currentUser);
        return ResponseEntity.ok(createdEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id, @RequestBody CreateEventRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userService.findByEmail(userEmail);
        
        EventDto updatedEvent = eventService.updateEvent(id, request, currentUser);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userService.findByEmail(userEmail);
        
        eventService.deleteEvent(id, currentUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<EventDto> registerForEvent(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userService.findByEmail(userEmail);
        
        EventDto event = eventService.registerForEvent(id, currentUser.getId());
        return ResponseEntity.ok(event);
    }

    @PostMapping("/{id}/unregister")
    public ResponseEntity<EventDto> unregisterFromEvent(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userService.findByEmail(userEmail);
        
        EventDto event = eventService.unregisterFromEvent(id, currentUser.getId());
        return ResponseEntity.ok(event);
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<EventDto>> getEventsByDepartment(@PathVariable String department) {
        List<EventDto> events = eventService.getEventsByDepartment(department);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventDto>> getUpcomingEvents() {
        List<EventDto> events = eventService.getUpcomingEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search")
    public ResponseEntity<List<EventDto>> searchEvents(@RequestParam String q) {
        List<EventDto> events = eventService.searchEvents(q);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<EventDto>> getMyEvents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userService.findByEmail(userEmail);
        
        List<EventDto> events = eventService.getEventsByCreator(currentUser.getId());
        return ResponseEntity.ok(events);
    }

    @GetMapping("/registered")
    public ResponseEntity<List<EventDto>> getRegisteredEvents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userService.findByEmail(userEmail);
        
        List<EventDto> events = eventService.getEventsByParticipant(currentUser.getId());
        return ResponseEntity.ok(events);
    }

    @PostMapping("/{id}/close-registration")
    public ResponseEntity<EventDto> closeRegistration(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userService.findByEmail(userEmail);

        EventDto updated = eventService.setRegistrationClosed(id, true, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/open-registration")
    public ResponseEntity<EventDto> openRegistration(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userService.findByEmail(userEmail);

        EventDto updated = eventService.setRegistrationClosed(id, false, currentUser);
        return ResponseEntity.ok(updated);
    }
} 