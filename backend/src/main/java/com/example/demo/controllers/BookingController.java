//package com.example.demo.controllers;
//
//import com.example.demo.models.Booking;
//import com.example.demo.models.Car;
//import com.example.demo.models.User;
//import com.example.demo.repositories.BookingRepository;
//import com.example.demo.repositories.CarRepository;
//import com.example.demo.repositories.UserRepository;
//import com.example.demo.security.UserDetailsImpl;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.LocalDate;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/bookings")
//@CrossOrigin(origins = "*")
//public class BookingController {
//
//    @Autowired
//    private BookingRepository bookingRepository;
//
//    @Autowired
//    private CarRepository carRepository;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    // ✅ FIXED: Accept JSON body instead of request parameters
//    @PostMapping
//    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> bookingData, 
//                                         Authentication authentication) {
//        try {
//            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
//            User user = userRepository.findById(userDetails.getId())
//                    .orElseThrow(() -> new RuntimeException("User not found"));
//
//            // Extract data from JSON body
//            Long carId = Long.valueOf(bookingData.get("carId").toString());
//            String startDateStr = bookingData.get("startDate").toString();
//            String endDateStr = bookingData.get("endDate").toString();
//
//            Car car = carRepository.findById(carId)
//                    .orElseThrow(() -> new RuntimeException("Car not found"));
//
//            if (!car.isAvailable()) {
//                return ResponseEntity.badRequest().body(Map.of("error", "Car is not available"));
//            }
//
//            LocalDate startDate = LocalDate.parse(startDateStr);
//            LocalDate endDate = LocalDate.parse(endDateStr);
//            LocalDate today = LocalDate.now();
//
//            // Validate dates
//            if (startDate.isBefore(today)) {
//                return ResponseEntity.badRequest().body(Map.of("error", "Start date cannot be in the past"));
//            }
//
//            if (endDate.isBefore(startDate) || endDate.isEqual(startDate)) {
//                return ResponseEntity.badRequest().body(Map.of("error", "End date must be after start date"));
//            }
//
//            // Create and save booking
//            Booking booking = new Booking(startDate, endDate, user, car);
//            Booking savedBooking = bookingRepository.save(booking);
//
//            // Update car availability
//            car.setAvailable(false);
//            carRepository.save(car);
//
//            Map<String, Object> response = new HashMap<>();
//            response.put("message", "Booking created successfully");
//            response.put("data", savedBooking);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Error creating booking: " + e.getMessage()));
//        }
//    }
//
//    // ✅ Get user's bookings with proper response format
//    @GetMapping("/my-bookings")
//    public ResponseEntity<?> getMyBookings(Authentication authentication) {
//        try {
//            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
//            User user = userRepository.findById(userDetails.getId())
//                    .orElseThrow(() -> new RuntimeException("User not found"));
//
//            List<Booking> bookings = bookingRepository.findByUser(user);
//            
//            Map<String, Object> response = new HashMap<>();
//            response.put("message", "Bookings fetched successfully");
//            response.put("data", bookings);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching bookings: " + e.getMessage()));
//        }
//    }
//
//    // ✅ Get all bookings for admin
//    @GetMapping("/all")
//    public ResponseEntity<?> getAllBookings() {
//        try {
//            List<Booking> bookings = bookingRepository.findAll();
//            
//            Map<String, Object> response = new HashMap<>();
//            response.put("message", "All bookings fetched successfully");
//            response.put("data", bookings);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching bookings: " + e.getMessage()));
//        }
//    }
//
//    // ✅ Cancel booking
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> cancelBooking(@PathVariable Long id, Authentication authentication) {
//        try {
//            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
//            User user = userRepository.findById(userDetails.getId())
//                    .orElseThrow(() -> new RuntimeException("User not found"));
//
//            Booking booking = bookingRepository.findById(id)
//                    .orElseThrow(() -> new RuntimeException("Booking not found"));
//
//            // Check if user owns the booking or is admin
//            if (!booking.getUser().getId().equals(user.getId())) {
//                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
//            }
//
//            // Free up the car
//            Car car = booking.getCar();
//            car.setAvailable(true);
//            carRepository.save(car);
//
//            bookingRepository.delete(booking);
//            
//            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
//
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Error cancelling booking: " + e.getMessage()));
//        }
//    }
//
//    // ✅ Get booking by ID
//    @GetMapping("/{id}")
//    public ResponseEntity<?> getBookingById(@PathVariable Long id, Authentication authentication) {
//        try {
//            Booking booking = bookingRepository.findById(id)
//                    .orElseThrow(() -> new RuntimeException("Booking not found"));
//            
//            Map<String, Object> response = new HashMap<>();
//            response.put("message", "Booking fetched successfully");
//            response.put("data", booking);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching booking: " + e.getMessage()));
//        }
//    }
//}
package com.example.demo.controllers;

import com.example.demo.models.Booking;
import com.example.demo.models.Car;
import com.example.demo.models.User;
import com.example.demo.repositories.BookingRepository;
import com.example.demo.repositories.CarRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ FIXED: Support both JSON body and query parameters
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody(required = false) Map<String, Object> bookingData,
                                         @RequestParam(required = false) Long carId,
                                         @RequestParam(required = false) String startDate,
                                         @RequestParam(required = false) String endDate,
                                         Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Handle both JSON body and query parameters
            Long actualCarId;
            String actualStartDate;
            String actualEndDate;

            if (bookingData != null) {
                // JSON body format
                actualCarId = Long.valueOf(bookingData.get("carId").toString());
                actualStartDate = bookingData.get("startDate").toString();
                actualEndDate = bookingData.get("endDate").toString();
            } else {
                // Query parameter format
                actualCarId = carId;
                actualStartDate = startDate;
                actualEndDate = endDate;
            }

            if (actualCarId == null || actualStartDate == null || actualEndDate == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required parameters"));
            }

            Car car = carRepository.findById(actualCarId)
                    .orElseThrow(() -> new RuntimeException("Car not found"));

            if (!car.isAvailable()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Car is not available"));
            }

            LocalDate start = LocalDate.parse(actualStartDate);
            LocalDate end = LocalDate.parse(actualEndDate);
            LocalDate today = LocalDate.now();

            // Validate dates
            if (start.isBefore(today)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Start date cannot be in the past"));
            }

            if (end.isBefore(start) || end.isEqual(start)) {
                return ResponseEntity.badRequest().body(Map.of("error", "End date must be after start date"));
            }

            // Create and save booking
            Booking booking = new Booking(start, end, user, car);
            Booking savedBooking = bookingRepository.save(booking);

            // Update car availability
            car.setAvailable(false);
            carRepository.save(car);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Booking created successfully");
            response.put("data", savedBooking);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error creating booking: " + e.getMessage()));
        }
    }

    // ✅ FIXED: Add BOTH endpoints to support different frontend calls
    @GetMapping("/me")
    public ResponseEntity<?> getMyBookingsMe(Authentication authentication) {
        return getMyBookings(authentication);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<?> getMyBookings(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Booking> bookings = bookingRepository.findByUser(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bookings fetched successfully");
            response.put("data", bookings);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching bookings: " + e.getMessage()));
        }
    }

    // Rest of your methods remain the same...
    @GetMapping("/all")
    public ResponseEntity<?> getAllBookings() {
        try {
            List<Booking> bookings = bookingRepository.findAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "All bookings fetched successfully");
            response.put("data", bookings);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching bookings: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            if (!booking.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            Car car = booking.getCar();
            car.setAvailable(true);
            carRepository.save(car);

            bookingRepository.delete(booking);
            
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error cancelling booking: " + e.getMessage()));
        }
    }
}