package com.project.security;

import java.util.Date;

import javax.crypto.SecretKey;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.project.entity.User;
import com.project.service.UserService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;


@Component
public class JwtTokenProvider {
	
	@Value("${jwt.secret}")
	private String jwtSecret;
	
	@Value("${jwt.expiration}")
	private Long jwtExpirationMs;
	
	private final UserService userService;
	
	public JwtTokenProvider(UserService userService) {
		this.userService = userService;
	}
	
	 private SecretKey getSigningKey() {
	        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
	    }
	
	public String generateToken(Authentication authentication) {
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
		String email = userDetails.getUsername();
		User user = userService.findByEmail(email);
		return generateTokenFromUser(user);
	}
	
	public String generateTokenFromUser(User user) {
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
		
		return Jwts.builder()
				.subject(user.getEmail())
				.claim("userId", user.getId())
				.claim("name", user.getName())
				.claim("role", user.getRole().name())
				.claim("authorities", "ROLE_" + user.getRole().name())
				.issuedAt(now)
				.expiration(expiryDate)
				.signWith(getSigningKey())
				.compact();
	}
	
	public User getUserFromToken(String token) {
		if (!validateToken(token)) {
			return null;
		}
		
		String email = getEmailFromToken(token);
		return userService.findByEmail(email);
	}
	
	private String getEmailFromToken(String token) {
		Claims claims = Jwts.parser()
				.verifyWith(getSigningKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
		
		return claims.getSubject();
	}
	
	public boolean validateToken(String token) {
		try {
			Jwts.parser()
					.verifyWith(getSigningKey())
					.build()
					.parseSignedClaims(token)
					.getPayload();
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			return false;
				
		}
	}
	
	
}
