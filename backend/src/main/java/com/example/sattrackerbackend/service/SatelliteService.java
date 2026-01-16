package com.example.sattrackerbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
public class SatelliteService {

    private final String apiKey;
    private final RestTemplate restTemplate;

    public SatelliteService(@Value("${n2yo.api.key}") String apiKey, RestTemplate restTemplate) {
        this.apiKey = apiKey;
        this.restTemplate = restTemplate;
    }

   public Map<String, Object> getNearbySatellites(double lat, double lng, int radius) {
        // Category 1 = Brightest satellites (more visible and reliable data)
        // Radius: 25 degrees is standard for visual horizon.
        int categoryId = 1;
        
        String url = String.format(Locale.US, 
            "https://api.n2yo.com/rest/v1/satellite/above/%f/%f/0/%d/%d?apiKey=%s", 
            lat, lng, radius, categoryId, apiKey);

        try {
            System.out.println("Requesting: " + url);
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    url, 
                    HttpMethod.GET, 
                    null, 
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            return Objects.requireNonNull(responseEntity.getBody());
        } catch (Exception e) {
            System.err.println("Error calling N2YO API: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch satellite data");
            return errorResponse;
        }
    }
}