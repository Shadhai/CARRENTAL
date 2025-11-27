package com.example.demo.controllers;

import com.example.demo.models.Car;
import com.example.demo.repositories.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/cars")
public class CarController {

    @Autowired
    private CarRepository carRepository;

    // Get all cars
    @GetMapping
    public ResponseEntity<?> getAllCars() {
        List<Car> cars = carRepository.findAll();
        return ResponseEntity.ok(Map.of(
                "message", "Cars fetched successfully",
                "data", cars
        ));
    }

    // Get available cars only
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableCars() {
        List<Car> cars = carRepository.findByAvailableTrue();
        return ResponseEntity.ok(Map.of(
                "message", "Available cars fetched successfully",
                "data", cars
        ));
    }

    // Get car by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getCarById(@PathVariable Long id) {
        return carRepository.findById(id).map(car ->
                ResponseEntity.ok(Map.of(
                        "message", "Car found",
                        "data", car
                ))
        ).orElse(ResponseEntity.status(404).body(Map.of(
                "error", "Car not found"
        )));
    }

    // Add new car (with optional image upload)
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createCar(
            @RequestParam("make") String make,
            @RequestParam("model") String model,
            @RequestParam("type") String type,
            @RequestParam("pricePerDay") Double pricePerDay,
            @RequestParam(value = "available", defaultValue = "true") boolean available,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Car car = new Car();
        car.setMake(make);
        car.setModel(model);
        car.setType(type);
        car.setPricePerDay(pricePerDay);
        car.setAvailable(available);

        if (file != null && !file.isEmpty()) {
            try {
                String folder = "src/main/resources/static/images/cars/";
                Files.createDirectories(Paths.get(folder));

                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path path = Paths.get(folder + fileName);
                Files.write(path, file.getBytes());

                car.setImageUrl("/images/cars/" + fileName);
            } catch (IOException e) {
                return ResponseEntity.status(500).body(Map.of(
                        "error", "Error saving image: " + e.getMessage()
                ));
            }
        }

        Car savedCar = carRepository.save(car);
        return ResponseEntity.ok(Map.of(
                "message", "Car created successfully",
                "data", savedCar
        ));
    }

    // Update car
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateCar(
            @PathVariable Long id,
            @RequestParam("make") String make,
            @RequestParam("model") String model,
            @RequestParam("type") String type,
            @RequestParam("pricePerDay") Double pricePerDay,
            @RequestParam("available") boolean available,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        return carRepository.findById(id).map(car -> {
            car.setMake(make);
            car.setModel(model);
            car.setType(type);
            car.setPricePerDay(pricePerDay);
            car.setAvailable(available);

            if (file != null && !file.isEmpty()) {
                try {
                    String folder = "src/main/resources/static/images/cars/";
                    Files.createDirectories(Paths.get(folder));

                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path path = Paths.get(folder + fileName);
                    Files.write(path, file.getBytes());

                    car.setImageUrl("/images/cars/" + fileName);
                } catch (IOException e) {
                    return ResponseEntity.status(500).body(Map.of(
                            "error", "Error saving image: " + e.getMessage()
                    ));
                }
            }

            Car updatedCar = carRepository.save(car);
            return ResponseEntity.ok(Map.of(
                    "message", "Car updated successfully",
                    "data", updatedCar
            ));
        }).orElse(ResponseEntity.status(404).body(Map.of(
                "error", "Car not found"
        )));
    }

    // Delete car
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable Long id) {
        return carRepository.findById(id).map(car -> {
            carRepository.delete(car);
            return ResponseEntity.ok(Map.of("message", "Car deleted successfully"));
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "Car not found")));
    }
}
