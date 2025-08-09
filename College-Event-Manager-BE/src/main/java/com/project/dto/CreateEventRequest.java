package com.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventRequest {
    private String title;
    private String description;
    private LocalDate date;
    private LocalTime time;
    private String department;
    private String location;
    private Integer maxParticipants;
    private String image;
} 