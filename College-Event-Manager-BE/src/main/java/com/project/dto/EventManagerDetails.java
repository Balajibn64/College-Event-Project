package com.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventManagerDetails {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String designation;
    private String phoneNumber;
} 