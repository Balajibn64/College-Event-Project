package com.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @Column(nullable = true, unique = true, length = 20)
    private String rollNumber;

    @Column(length = 50)
    private String department;

    @Column(length = 15)
    private String phoneNumber;

    @Column(length = 10)
    private String year;

    @Column(length = 100)
    private String collegeName;
}