package com.example.sattrackerbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
public class AsteroidService {

    private final String apiKey;
    private final RestTemplate restTemplate;

    public AsteroidService(@Value("${nasa.api.key}") String apiKey, RestTemplate restTemplate) {
        this.apiKey = apiKey;
        this.restTemplate = restTemplate;
    }

public Map<String, Object> getNearbyAsteroids(double lat, double lng, int radius) {
    LocalDate today = LocalDate.now();
    
    // CHANGE: Fetch 7 days of data instead of 1 day to get more objects
    LocalDate nextWeek = today.plusDays(7); 

    String url = "https://api.nasa.gov/neo/rest/v1/feed?start_date=%s&end_date=%s&api_key=%s".formatted(
            today.toString(), nextWeek.toString(), apiKey);
        try {
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> response = Objects.requireNonNull(responseEntity.getBody());
            return response;
        } catch (Exception e) {
            System.err.println("Error calling NASA API: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch asteroid data");
            return errorResponse;
        }
    }
}
