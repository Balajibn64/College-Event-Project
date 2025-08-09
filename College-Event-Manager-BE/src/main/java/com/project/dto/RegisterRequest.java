package com.project.dto;

import lombok.Data;
import com.project.enums.UserRole;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private UserRole role;
    private String department;
    private String designation;
    private String phoneNumber;
} 