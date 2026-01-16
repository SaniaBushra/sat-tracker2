package com.example.sattrackerbackend.controller;

import com.example.sattrackerbackend.service.AsteroidService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/asteroids")
public class AsteroidController {

    private final AsteroidService asteroidService;

    public AsteroidController(AsteroidService asteroidService) {
        this.asteroidService = asteroidService;
    }

    @GetMapping("/nearby")
    public Map<String, Object> getNearbyAsteroids(@RequestParam double lat, @RequestParam double lng, @RequestParam int radius) {
        return asteroidService.getNearbyAsteroids(lat, lng, radius);
    }
}
