package com.example.demo.controller;

import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.LoginResponseDTO;
import com.example.demo.dto.LogoutResponseDTO;
import com.example.demo.dto.PasswordUpdateDTO;
import com.example.demo.dto.PasswordUpdateResponseDTO;
import com.example.demo.dto.RegisterRequestDTO;
import com.example.demo.dto.RegisterResponseDTO;
import com.example.demo.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "API d'authentification")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    @Operation(summary = "Connexion utilisateur", description = "Authentifie un utilisateur avec email et mot de passe")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.login(loginRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/register")
    @Operation(summary = "Inscription utilisateur", description = "Inscrit un nouvel utilisateur")
    public ResponseEntity<RegisterResponseDTO> register(@RequestBody RegisterRequestDTO registerRequest) {
        RegisterResponseDTO response = authService.register(registerRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/password/{userId}")
    @Operation(summary = "Mise à jour du mot de passe", description = "Met à jour le mot de passe d'un utilisateur")
    public ResponseEntity<PasswordUpdateResponseDTO> updatePassword(
            @PathVariable Integer userId,
            @RequestBody PasswordUpdateDTO passwordUpdateDTO) {
        PasswordUpdateResponseDTO response = authService.updatePassword(userId, passwordUpdateDTO);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/test")
    @Operation(summary = "Test d'authentification", description = "Endpoint de test pour vérifier l'authentification")
    public ResponseEntity<String> testAuth() {
        return ResponseEntity.ok("Authentification réussie! Vous êtes connecté.");
    }
    
    @PostMapping("/logout")
    @Operation(summary = "Déconnexion utilisateur", description = "Déconnecte un utilisateur en invalidant son token")
    public ResponseEntity<LogoutResponseDTO> logout(@RequestHeader("Authorization") String authorizationHeader) {
        LogoutResponseDTO response = authService.logout(authorizationHeader);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
} 