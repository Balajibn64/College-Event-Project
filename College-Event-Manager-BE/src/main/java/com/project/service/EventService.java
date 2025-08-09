package com.project.service;

import com.project.dto.CreateEventRequest;
import com.project.dto.EventDto;
import com.project.entity.Event;
import com.project.entity.User;
import com.project.repository.EventRepository;
import com.project.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public List<EventDto> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public EventDto getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return convertToDto(event);
    }

    public EventDto createEvent(CreateEventRequest request, User createdBy) {
        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .date(request.getDate())
                .time(request.getTime())
                .department(request.getDepartment())
                .location(request.getLocation())
                .maxParticipants(request.getMaxParticipants())
                .currentParticipants(0)
                .image(request.getImage())
                .createdBy(createdBy)
                .build();

        Event savedEvent = eventRepository.save(event);
        return convertToDto(savedEvent);
    }

    public EventDto updateEvent(Long id, CreateEventRequest request, User currentUser) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Check if the current user is the creator of the event
        if (!event.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to edit this event");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setDate(request.getDate());
        event.setTime(request.getTime());
        event.setDepartment(request.getDepartment());
        event.setLocation(request.getLocation());
        event.setMaxParticipants(request.getMaxParticipants());
        event.setImage(request.getImage());

        Event updatedEvent = eventRepository.save(event);
        return convertToDto(updatedEvent);
    }

    public void deleteEvent(Long id, User currentUser) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Check if the current user is the creator of the event
        if (!event.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to delete this event");
        }

        eventRepository.deleteById(id);
    }

    public EventDto registerForEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Auto-close registration if event has already started
        if (hasEventStarted(event)) {
            if (!event.isRegistrationClosed()) {
                event.setRegistrationClosed(true);
                eventRepository.save(event);
            }
            throw new RuntimeException("Registration is closed as the event has already started");
        }

        if (event.isRegistrationClosed()) {
            throw new RuntimeException("Registration is closed for this event");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (event.getCurrentParticipants() >= event.getMaxParticipants()) {
            throw new RuntimeException("Event is full");
        }

        if (event.getParticipants().contains(user)) {
            throw new RuntimeException("User is already registered for this event");
        }

        event.getParticipants().add(user);
        event.setCurrentParticipants(event.getCurrentParticipants() + 1);

        Event savedEvent = eventRepository.save(event);
        return convertToDto(savedEvent);
    }

    public EventDto unregisterFromEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!event.getParticipants().contains(user)) {
            throw new RuntimeException("User is not registered for this event");
        }

        event.getParticipants().remove(user);
        event.setCurrentParticipants(event.getCurrentParticipants() - 1);

        Event savedEvent = eventRepository.save(event);
        return convertToDto(savedEvent);
    }

    public List<EventDto> getEventsByDepartment(String department) {
        return eventRepository.findByDepartment(department).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<EventDto> getUpcomingEvents() {
        return eventRepository.findByDateAfter(java.time.LocalDate.now()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<EventDto> searchEvents(String searchTerm) {
        return eventRepository.findByTitleOrDescriptionContaining(searchTerm).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<EventDto> getEventsByCreator(Long createdById) {
        return eventRepository.findByCreatedById(createdById).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public EventDto setRegistrationClosed(Long eventId, boolean closed, User currentUser) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        boolean isCreator = event.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == com.project.enums.UserRole.ADMIN;
        if (!isCreator && !isAdmin) {
            throw new RuntimeException("Only the event creator or an admin can modify registration state for this event");
        }

        // Prevent opening registration for events that already started
        if (!closed && hasEventStarted(event)) {
            throw new RuntimeException("Cannot reopen registration. The event has already started");
        }

        event.setRegistrationClosed(closed);
        Event saved = eventRepository.save(event);
        return convertToDto(saved);
    }

    public List<EventDto> getEventsByParticipant(Long userId) {
        return eventRepository.findEventsByParticipantId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private EventDto convertToDto(Event event) {
        Set<String> participantEmails = event.getParticipants().stream()
                .map(User::getEmail)
                .collect(Collectors.toSet());

        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .date(event.getDate())
                .time(event.getTime())
                .department(event.getDepartment())
                .location(event.getLocation())
                .maxParticipants(event.getMaxParticipants())
                .currentParticipants(event.getCurrentParticipants())
                .image(event.getImage())
                // Auto-reflect closed if event has started
                .registrationClosed(event.isRegistrationClosed() || hasEventStarted(event))
                .createdBy(event.getCreatedBy().getEmail())
                .participants(participantEmails)
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }

    private boolean hasEventStarted(Event event) {
        try {
            java.time.LocalDate eventDate = event.getDate();
            java.time.LocalTime eventTime = event.getTime() != null
                    ? event.getTime()
                    : java.time.LocalTime.MIDNIGHT;

            java.time.LocalDateTime eventDateTime = java.time.LocalDateTime.of(eventDate, eventTime);
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            return !now.isBefore(eventDateTime);
        } catch (Exception e) {
            // If any issue, assume not started
            return false;
        }
    }
} 