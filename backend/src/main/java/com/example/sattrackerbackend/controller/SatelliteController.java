package com.example.sattrackerbackend.controller;

import com.example.sattrackerbackend.service.SatelliteService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/satellites")
public class SatelliteController {

    private final SatelliteService satelliteService;

    public SatelliteController(SatelliteService satelliteService) {
        this.satelliteService = satelliteService;
    }

    @GetMapping("/nearby")
    public Map<String, Object> getNearbySatellites(@RequestParam double lat, @RequestParam double lng, @RequestParam int radius) {
        return satelliteService.getNearbySatellites(lat, lng, radius);
    }
}
