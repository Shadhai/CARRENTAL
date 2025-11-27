package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String make;      
    private String model;     
    private String type;      
    private Double pricePerDay;
    private boolean available = true;

    private String imageUrl; // <-- NEW FIELD for storing image path/URL

    public Car() {}

    public Car(String make, String model, String type, Double pricePerDay, String imageUrl) {
        this.make = make;
        this.model = model;
        this.type = type;
        this.pricePerDay = pricePerDay;
        this.available = true;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public String getMake() { return make; }
    public String getModel() { return model; }
    public String getType() { return type; }
    public Double getPricePerDay() { return pricePerDay; }
    public boolean isAvailable() { return available; }
    public String getImageUrl() { return imageUrl; }

    public void setMake(String make) { this.make = make; }
    public void setModel(String model) { this.model = model; }
    public void setType(String type) { this.type = type; }
    public void setPricePerDay(Double pricePerDay) { this.pricePerDay = pricePerDay; }
    public void setAvailable(boolean available) { this.available = available; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
