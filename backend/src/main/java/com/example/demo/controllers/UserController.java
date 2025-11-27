package com.example.demo.controllers;

import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Get all users
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(Map.of(
            "message", "Users fetched successfully",
            "data", userRepository.findAll()
        ));
    }

    // Get all admin users
    @GetMapping("/admins")
    public ResponseEntity<?> getAllAdmins() {
        return ResponseEntity.ok(Map.of(
            "message", "Admin users fetched successfully",
            "data", userRepository.findAllAdmins()
        ));
    }

    // Get all regular users
    @GetMapping("/regular")
    public ResponseEntity<?> getAllRegularUsers() {
        return ResponseEntity.ok(Map.of(
            "message", "Regular users fetched successfully",
            "data", userRepository.findAllUsers()
        ));
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id).map(user ->
            ResponseEntity.ok(Map.of(
                "message", "User found",
                "data", user
            ))
        ).orElse(ResponseEntity.status(404).body(Map.of(
            "error", "User not found"
        )));
    }

    // Get user by username
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        return userRepository.findByUsername(username).map(user ->
            ResponseEntity.ok(Map.of(
                "message", "User found",
                "data", user
            ))
        ).orElse(ResponseEntity.status(404).body(Map.of(
            "error", "User not found"
        )));
    }

    // Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email).map(user ->
            ResponseEntity.ok(Map.of(
                "message", "User found",
                "data", user
            ))
        ).orElse(ResponseEntity.status(404).body(Map.of(
            "error", "User not found"
        )));
    }

    // Delete user by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // Check if user exists by ID
    @GetMapping("/exists/{id}")
    public ResponseEntity<?> userExists(@PathVariable Long id) {
        boolean exists = userRepository.existsById(id);
        return ResponseEntity.ok(Map.of(
            "exists", exists,
            "message", exists ? "User exists" : "User does not exist"
        ));
    }
}