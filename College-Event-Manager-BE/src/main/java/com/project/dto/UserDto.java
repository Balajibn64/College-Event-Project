package com.project.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.project.entity.User;
import com.project.enums.UserRole;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private UserRole role;
    private String department;
    private Boolean active;
    
    // Convert User entity to UserDto
    public static UserDto fromUser(User user) {
        UserDto.UserDtoBuilder builder = UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .active(user.isActive());
        
        // Add department if user is a student
        if (user.getStudent() != null) {
            builder.department(user.getStudent().getDepartment());
        }
        
        return builder.build();
    }
} 