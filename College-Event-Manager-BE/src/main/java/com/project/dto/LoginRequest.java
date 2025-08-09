package com.project.dto;

import lombok.Data;
import com.project.enums.UserRole;

@Data
public class LoginRequest {
    private String email;
    private String password;
    private UserRole role;
} 