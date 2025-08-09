package com.project.service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.project.dto.UserDto;
import com.project.dto.RegisterRequest;
import com.project.entity.User;
import com.project.enums.UserRole;
import com.project.repository.UserRepository;

@Service
public class UserService {

	private final UserRepository userRepo;
	private final PasswordEncoder passwordEncoder;
	private final StudentService studentService;
	private final EventManagerService eventManagerService;

	public UserService(UserRepository userRepo, PasswordEncoder passwordEncoder, StudentService studentService, EventManagerService eventManagerService) {
		this.userRepo = userRepo;
		this.passwordEncoder = passwordEncoder;
		this.studentService = studentService;
		this.eventManagerService = eventManagerService;
	}

	// CRUD METHODS
	
	// Create user using DTO (with direct password encryption)
	public User createUser(RegisterRequest req) {
		if (existsByEmail(req.getEmail())) {
			throw new RuntimeException("User with email " + req.getEmail() + " already exists");
		}
		
		User user = User.builder()
				.email(req.getEmail())
				.password(passwordEncoder.encode(req.getPassword())) // Direct encryption
				.name(req.getName())
				.role(req.getRole())
				.build();
		
		user = userRepo.save(user);
		
		// If user is a student and department is provided, create student record
		if (req.getRole() == UserRole.STUDENT && req.getDepartment() != null && !req.getDepartment().trim().isEmpty()) {
			studentService.createStudent(user, req.getDepartment());
		}
		
		// If user is an event manager, create event manager record
		if (req.getRole() == UserRole.EVENT_MANAGER) {
			eventManagerService.createEventManager(user, req.getDesignation(), req.getPhoneNumber());
		}
		
		return user;
	}
	
	// Create user using individual parameters
	public User createUser(String email, String password, String name, UserRole role) {
		if (existsByEmail(email)) {
			throw new RuntimeException("User with email " + email + " already exists");
		}
		
		User user = User.builder()
				.email(email)
				.password(passwordEncoder.encode(password)) // Direct encryption
				.name(name)
				.role(role)
				.build();
		
		return userRepo.save(user);
	}
	
	// Read user by ID
	public User findById(Long id) {
		return userRepo.findById(id)
				.orElseThrow(() -> new RuntimeException("User not found with id: " + id));
	}
	
	// Read user by email
	public User findByEmail(String email) {
		return userRepo.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found with email: " + email));
	}
	
	// Read all users
	public List<User> findAll() {
		return userRepo.findAll();
	}
	
	// Update user (without password)
	public User updateUser(Long id, UserDto userDto) {
		User existingUser = findById(id);
		
        if (userDto.getName() != null) {
            existingUser.setName(userDto.getName());
        }
        if (userDto.getEmail() != null) {
            existingUser.setEmail(userDto.getEmail());
        }
        if (userDto.getRole() != null) {
            existingUser.setRole(userDto.getRole());
        }
		if (userDto.getActive() != null) {
			existingUser.setActive(userDto.getActive());
		}
		
		return userRepo.save(existingUser);
	}
	
	// Update password separately
	public User updatePassword(Long id, String newPassword) {
		User existingUser = findById(id);
		existingUser.setPassword(passwordEncoder.encode(newPassword)); // Direct encryption
		return userRepo.save(existingUser);
	}
	
	// Delete user
	public void deleteUser(Long id) {
		if (!userRepo.existsById(id)) {
			throw new RuntimeException("User not found with id: " + id);
		}
		userRepo.deleteById(id);
	}
	
	// Save user (for general updates)
	public User save(User user) {
		return userRepo.save(user);
	}
	
	// Check if email exists
	public boolean existsByEmail(String email) {
		return userRepo.existsByEmail(email);
	}
	
	// Check if user exists by ID
	public boolean existsById(Long id) {
		return userRepo.existsById(id);
	}
	
	// DTO METHODS
	
	// Get all users as DTOs
	public List<UserDto> getAllUsersAsDto() {
		return userRepo.findAll().stream()
				.map(UserDto::fromUser)
				.collect(Collectors.toList());
	}
	
	// Get user by ID as DTO
	public UserDto getUserByIdAsDto(Long id) {
		User user = findById(id);
		return UserDto.fromUser(user);
	}
	
	// Get user by email as DTO
	public UserDto getUserByEmailAsDto(String email) {
		User user = findByEmail(email);
		return UserDto.fromUser(user);
	}
	
	// UTILITY METHODS
	
	// Get users by role
	public List<UserDto> getUsersByRole(UserRole role) {
		return userRepo.findAll().stream()
				.filter(user -> user.getRole() == role)
				.map(UserDto::fromUser)
				.collect(Collectors.toList());
	}
	
	// Count users
	public long countUsers() {
		return userRepo.count();
	}
	
	// Count users by role
	public long countUsersByRole(UserRole role) {
		return userRepo.findAll().stream()
				.filter(user -> user.getRole() == role)
				.count();
	}
}
