package com.project.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.project.entity.User;
import com.project.enums.UserRole;
import com.project.service.UserService;
import com.project.service.StudentService;
import com.project.service.EventManagerService;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final StudentService studentService;
    private final EventManagerService eventManagerService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserService userService, StudentService studentService, EventManagerService eventManagerService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.studentService = studentService;
        this.eventManagerService = eventManagerService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createDefaultUsers();
    }

    private void createDefaultUsers() {
        // Create admin if not exists
        if (!userService.existsByEmail("admin@example.com")) {
            User admin = User.builder()
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("password"))
                    .name("Default Admin")
                    .role(UserRole.ADMIN)
                    .build();
            userService.save(admin);
            System.out.println("Default admin user created: admin@example.com / password");
        } else {
            // Ensure admin has correct role and password
            try {
                User admin = userService.findByEmail("admin@example.com");
                if (admin.getRole() != UserRole.ADMIN) {
                    admin.setRole(UserRole.ADMIN);
                    admin.setPassword(passwordEncoder.encode("password"));
                    userService.save(admin);
                    System.out.println("Admin user role and password updated");
                }
            } catch (Exception e) {
                System.out.println("Error updating admin user: " + e.getMessage());
            }
        }

        // Create student if not exists
        if (!userService.existsByEmail("student@example.com")) {
            User student = User.builder()
                    .email("student@example.com")
                    .password(passwordEncoder.encode("password"))
                    .name("Default Student")
                    .role(UserRole.STUDENT)
                    .build();
            student = userService.save(student);
            studentService.createStudent(student, "Computer Science");
            System.out.println("Default student user created: student@example.com / password");
        }

        // Create event manager if not exists
        if (!userService.existsByEmail("eventmanager@example.com")) {
            User eventManager = User.builder()
                    .email("eventmanager@example.com")
                    .password(passwordEncoder.encode("password"))
                    .name("Default Event Manager")
                    .role(UserRole.EVENT_MANAGER)
                    .build();
            eventManager = userService.save(eventManager);
            eventManagerService.createEventManager(eventManager, "Senior Event Coordinator", "+1234567890");
            System.out.println("Default event manager user created: eventmanager@example.com / password");
        }
    }
} 