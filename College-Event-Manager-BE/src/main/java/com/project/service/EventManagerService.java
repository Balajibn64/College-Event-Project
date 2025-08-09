package com.project.service;

import org.springframework.stereotype.Service;
import com.project.entity.EventManager;
import com.project.entity.User;
import com.project.dto.EventManagerDetails;
import com.project.repository.EventManagerRepository;

@Service
public class EventManagerService {

    private final EventManagerRepository eventManagerRepository;

    public EventManagerService(EventManagerRepository eventManagerRepository) {
        this.eventManagerRepository = eventManagerRepository;
    }

    public EventManager createEventManager(User user, String designation, String phoneNumber) {
        EventManager eventManager = EventManager.builder()
                .user(user)
                .designation(designation)
                .phoneNumber(phoneNumber)
                .build();
        return eventManagerRepository.save(eventManager);
    }

    public EventManager findByUserId(Long userId) {
        return eventManagerRepository.findByUserId(userId);
    }

    public EventManager save(EventManager eventManager) {
        return eventManagerRepository.save(eventManager);
    }

    public EventManagerDetails getEventManagerDetails(User user) {
        EventManager eventManager = findByUserId(user.getId());
        if (eventManager == null) {
            return null;
        }

        return EventManagerDetails.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .designation(eventManager.getDesignation())
                .phoneNumber(eventManager.getPhoneNumber())
                .build();
    }

    public EventManagerDetails updateEventManagerDetails(User user, EventManagerDetails details) {
        EventManager eventManager = findByUserId(user.getId());
        
        if (eventManager == null) {
            // Create new event manager record
            eventManager = createEventManager(user, details.getDesignation(), details.getPhoneNumber());
        } else {
            // Update existing event manager record
            eventManager.setDesignation(details.getDesignation());
            eventManager.setPhoneNumber(details.getPhoneNumber());
            eventManager = save(eventManager);
        }

        return getEventManagerDetails(user);
    }
} 