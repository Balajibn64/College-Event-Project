package com.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {
	
	@Id
	private Long id;
	
	@OneToOne
	@MapsId
	@JoinColumn(name = "id")
	private User user;
	
	@Column(length = 50)
	private String designation;
	
	@Column(length = 15)
	private String phoneNumber; 
}
