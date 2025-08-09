package com.project.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "event_managers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventManager {
	
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
