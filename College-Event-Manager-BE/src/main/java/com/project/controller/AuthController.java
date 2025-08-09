package com.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.project.dto.LoginRequest;
import com.project.dto.LoginResponse;
import com.project.dto.RegisterRequest;
import com.project.dto.UserDto;
import com.project.dto.ChangePasswordRequest;
import com.project.dto.StudentDetails;
import com.project.dto.EventManagerDetails;
import com.project.entity.User;
import com.project.entity.Student;
import com.project.enums.UserRole;
import com.project.security.JwtTokenProvider;
import com.project.service.UserService;
import com.project.service.StudentService;
import com.project.service.EventManagerService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    private final JwtTokenProvider tokenProvider;

    private final UserService userService;
    private final StudentService studentService;
    private final EventManagerService eventManagerService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider, 
                         UserService userService, StudentService studentService, EventManagerService eventManagerService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
        this.studentService = studentService;
        this.eventManagerService = eventManagerService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            // Get user and ensure account is active
            User user = userService.findByEmail(authentication.getName());
            if (!user.isActive()) {
                return ResponseEntity.status(403).body("Account is deactivated. Please contact admin.");
            }
            
            // Check if role matches (if role is provided in request)
            if (loginRequest.getRole() != null && user.getRole() != loginRequest.getRole()) {
                return ResponseEntity.badRequest().body("Invalid role for this user");
            }
            
            String token = tokenProvider.generateTokenFromUser(user);

            // Return response with DTO
            LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .user(UserDto.fromUser(user))
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid email or password");
        }
    }





    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            // Check if email already exists
            if (userService.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest().body("Email already exists");
            }

            // Create user (password will be encrypted in service)
            User user = userService.createUser(registerRequest);
            if (!user.isActive()) {
                return ResponseEntity.status(403).body("Account is deactivated. Please contact admin.");
            }
            
            // Generate token
            String token = tokenProvider.generateTokenFromUser(user);

            // Return response with DTO
            LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .user(UserDto.fromUser(user))
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName());
            return ResponseEntity.ok(UserDto.fromUser(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch profile: " + e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserDto userDto, Authentication authentication) {
        try {
            User currentUser = userService.findByEmail(authentication.getName());
            
            // Update user details
            currentUser.setName(userDto.getName());
            currentUser.setEmail(userDto.getEmail());
            
            User updatedUser = userService.save(currentUser);
            
            // Update student department if applicable
            if (currentUser.getRole() == UserRole.STUDENT && userDto.getDepartment() != null) {
                Student student = studentService.findByUserId(currentUser.getId());
                if (student != null) {
                    student.setDepartment(userDto.getDepartment());
                    studentService.save(student);
                }
            }
            
            return ResponseEntity.ok(UserDto.fromUser(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update profile: " + e.getMessage());
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName());
            
            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body("Current password is incorrect");
            }
            
            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userService.save(user);
            
            return ResponseEntity.ok("Password changed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to change password: " + e.getMessage());
        }
    }

    @GetMapping("/student-details")
    public ResponseEntity<?> getStudentDetails(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName());
            
            if (user.getRole() != UserRole.STUDENT) {
                return ResponseEntity.badRequest().body("This endpoint is only for students");
            }
            
            StudentDetails studentDetails = studentService.getStudentDetails(user);
            if (studentDetails == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(studentDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch student details: " + e.getMessage());
        }
    }

    @PutMapping("/student-details")
    public ResponseEntity<?> updateStudentDetails(@RequestBody StudentDetails studentDetails, Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName());
            
            if (user.getRole() != UserRole.STUDENT) {
                return ResponseEntity.badRequest().body("This endpoint is only for students");
            }
            
            // Update user basic info
            user.setName(studentDetails.getName());
            user.setEmail(studentDetails.getEmail());
            userService.save(user);
            
            // Update student details
            StudentDetails updatedDetails = studentService.updateStudentDetails(user, studentDetails);
            
            return ResponseEntity.ok(updatedDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update student details: " + e.getMessage());
        }
    }

    @GetMapping("/event-manager-details")
    public ResponseEntity<?> getEventManagerDetails(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName());
            
            if (user.getRole() != UserRole.EVENT_MANAGER) {
                return ResponseEntity.badRequest().body("Access denied. Only event managers can access event manager details.");
            }
            
            EventManagerDetails details = eventManagerService.getEventManagerDetails(user);
            if (details == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch event manager details: " + e.getMessage());
        }
    }

    @PutMapping("/event-manager-details")
    public ResponseEntity<?> updateEventManagerDetails(@RequestBody EventManagerDetails eventManagerDetails, Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName());
            
            if (user.getRole() != UserRole.EVENT_MANAGER) {
                return ResponseEntity.badRequest().body("Access denied. Only event managers can update event manager details.");
            }
            
            EventManagerDetails updatedDetails = eventManagerService.updateEventManagerDetails(user, eventManagerDetails);
            return ResponseEntity.ok(updatedDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update event manager details: " + e.getMessage());
        }
    }
}
