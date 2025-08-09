package com.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.project.entity.Student;
import com.project.entity.User;
import com.project.repository.StudentRepository;
import com.project.dto.StudentDetails;

@Service
public class StudentService {

    private final StudentRepository studentRepo;

    	public StudentService(StudentRepository studentRepo) {
		this.studentRepo = studentRepo;
	}

    public Student createStudent(User user, String department) {
        Student student = Student.builder()
                .user(user)
                .department(department)
                .build();
        
        return studentRepo.save(student);
    }

    public Student findByUserId(Long userId) {
        return studentRepo.findByUserId(userId)
                .orElse(null);
    }

    public Student save(Student student) {
        return studentRepo.save(student);
    }

    public StudentDetails getStudentDetails(User user) {
        Student student = findByUserId(user.getId());
        if (student == null) {
            return null;
        }
        
        return StudentDetails.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .rollNumber(student.getRollNumber())
                .department(student.getDepartment())
                .phoneNumber(student.getPhoneNumber())
                .year(student.getYear())
                .collegeName(student.getCollegeName())
                .build();
    }

    public StudentDetails updateStudentDetails(User user, StudentDetails details) {
        Student student = findByUserId(user.getId());
        if (student == null) {
            // Create new student record if it doesn't exist
            student = Student.builder()
                    .user(user)
                    .department(details.getDepartment())
                    .rollNumber(details.getRollNumber())
                    .phoneNumber(details.getPhoneNumber())
                    .year(details.getYear())
                    .collegeName(details.getCollegeName())
                    .build();
        } else {
            // Update existing student record
            student.setDepartment(details.getDepartment());
            student.setRollNumber(details.getRollNumber());
            student.setPhoneNumber(details.getPhoneNumber());
            student.setYear(details.getYear());
            student.setCollegeName(details.getCollegeName());
        }
        
        student = studentRepo.save(student);
        
        return StudentDetails.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .rollNumber(student.getRollNumber())
                .department(student.getDepartment())
                .phoneNumber(student.getPhoneNumber())
                .year(student.getYear())
                .collegeName(student.getCollegeName())
                .build();
    }
} 