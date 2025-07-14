package com.example.demo.controller;

import com.example.demo.dto.DepartementDashboardDTO;
import com.example.demo.service.DepartementDashboardService;
import com.example.demo.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "API du tableau de bord département")
@CrossOrigin(origins = "*")
public class DepartementDashboardController {

    @Autowired
    private DepartementDashboardService departementDashboardService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/departement")
    @Operation(summary = "Tableau de bord département", description = "Récupère les informations du département de l'utilisateur connecté avec budget et dépenses récentes")
    public ResponseEntity<DepartementDashboardDTO> getDepartementDashboard(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            // Extract token from Authorization header
            String token = authorizationHeader;
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            // Extract user ID from token
            Integer userId = jwtUtil.getUserIdFromToken(token);
            
            // Get dashboard data
            DepartementDashboardDTO dashboard = departementDashboardService.getDepartementDashboard(userId);
            
            return ResponseEntity.ok(dashboard);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 