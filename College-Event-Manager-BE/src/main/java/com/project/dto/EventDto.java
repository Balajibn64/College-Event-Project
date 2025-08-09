package com.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {
    private Long id;
    private String title;
    private String description;
    private LocalDate date;
    private LocalTime time;
    private String department;
    private String location;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private String image;
    private boolean registrationClosed;
    private String createdBy;
    private Set<String> participants;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
} 