package com.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/public")
    public ResponseEntity<String> publicEndpoint() {
        return ResponseEntity.ok("This is a public endpoint - no authentication required");
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('EVENT_MANAGER')")
    public ResponseEntity<String> userEndpoint() {
        return ResponseEntity.ok("This is a user endpoint - any authenticated user can access");
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminEndpoint() {
        return ResponseEntity.ok("This is an admin endpoint - only admins can access");
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> studentEndpoint() {
        return ResponseEntity.ok("This is a student endpoint - only students can access");
    }

    @GetMapping("/event-manager")
    @PreAuthorize("hasRole('EVENT_MANAGER')")
    public ResponseEntity<String> eventManagerEndpoint() {
        return ResponseEntity.ok("This is an event manager endpoint - only event managers can access");
    }
} 