package com.project.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDetails {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String rollNumber;
    private String department;
    private String phoneNumber;
    private String year;
    private String collegeName;
} 