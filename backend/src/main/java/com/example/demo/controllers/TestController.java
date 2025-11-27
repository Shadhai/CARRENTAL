package com.example.demo.controllers;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:3000") // Additional CORS for testing
public class TestController {

    @GetMapping("/cors")
    public String testCors() {
        return "CORS is working!";
    }

    @GetMapping("/auth-test")
    public String authTest() {
        return "Authentication is working!";
    }
}