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
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "🔐 Authentification", description = "API pour l'authentification et la gestion des comptes utilisateurs")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    @Operation(
        summary = "Connexion utilisateur",
        description = "Authentifie un utilisateur avec son email et mot de passe. Retourne un token JWT valide.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Informations de connexion",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginRequestDTO.class),
                examples = @ExampleObject(
                    name = "Connexion réussie",
                    value = """
                    {
                        "email": "user@company.com",
                        "password": "password123"
                    }
                    """
                )
            )
        )
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Connexion réussie",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginResponseDTO.class),
                examples = @ExampleObject(
                    name = "Réponse de succès",
                    value = """
                    {
                        "success": true,
                        "message": "Connexion réussie",
                        "token": "eyJhbGciOiJIUzI1NiJ9...",
                        "user": {
                            "id": 1,
                            "nom": "John Doe",
                            "email": "user@company.com",
                            "role": "USER",
                            "matricule": "EMP001"
                        }
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Échec de connexion",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginResponseDTO.class),
                examples = @ExampleObject(
                    name = "Réponse d'erreur",
                    value = """
                    {
                        "success": false,
                        "message": "Email ou mot de passe incorrect",
                        "token": null,
                        "user": null
                    }
                    """
                )
            )
        )
    })
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.login(loginRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/register")
    @Operation(
        summary = "Inscription utilisateur",
        description = "Crée un nouveau compte utilisateur. Le mot de passe sera généré automatiquement et envoyé par email."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Inscription réussie",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RegisterResponseDTO.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Échec de l'inscription",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RegisterResponseDTO.class)
            )
        )
    })
    public ResponseEntity<RegisterResponseDTO> register(@RequestBody RegisterRequestDTO registerRequest) {
        RegisterResponseDTO response = authService.register(registerRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/password/{userId}")
    @Operation(
        summary = "Mise à jour du mot de passe",
        description = "Met à jour le mot de passe d'un utilisateur spécifique"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Mot de passe mis à jour avec succès"),
        @ApiResponse(responseCode = "400", description = "Échec de la mise à jour")
    })
    public ResponseEntity<PasswordUpdateResponseDTO> updatePassword(
            @Parameter(description = "ID de l'utilisateur", required = true)
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
    @Operation(
        summary = "Test d'authentification",
        description = "Endpoint de test pour vérifier l'authentification"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Authentification valide"),
        @ApiResponse(responseCode = "401", description = "Token invalide ou manquant")
    })
    public ResponseEntity<String> testAuth() {
        return ResponseEntity.ok("Authentification réussie! Vous êtes connecté.");
    }
    
    @PostMapping("/logout")
    @Operation(
        summary = "Déconnexion utilisateur",
        description = "Déconnecte un utilisateur en invalidant son token JWT"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Déconnexion réussie",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LogoutResponseDTO.class)
            )
        ),
        @ApiResponse(responseCode = "400", description = "Échec de la déconnexion")
    })
    public ResponseEntity<LogoutResponseDTO> logout(
            @Parameter(description = "Token JWT dans le header Authorization", required = true)
            @RequestHeader("Authorization") String authorizationHeader) {
        LogoutResponseDTO response = authService.logout(authorizationHeader);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
} 