package com.project.security;


import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.project.entity.User;
import com.project.service.UserService;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserService userService;
    
    	public CustomUserDetailsService(UserService userService) {
		this.userService = userService;
	}
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            User user = userService.findByEmail(email);
            return new CustomUserDetails(user);
        } catch (Exception e) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
    }
} 