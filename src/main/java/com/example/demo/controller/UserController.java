package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.UserService;
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

import java.util.List;

@RestController
@RequestMapping("/api/user")
@Tag(name = "👤 Utilisateur", description = "API pour les utilisateurs (responsables département) - Gestion du profil, tableau de bord, dépenses")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    @Autowired
    private UserService userService;

    // ==================== DASHBOARD ====================
    
    @GetMapping("/dashboard")
    @Operation(
        summary = "Tableau de bord utilisateur",
        description = "Récupère le tableau de bord de l'utilisateur connecté avec les statistiques de son département"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Tableau de bord récupéré avec succès",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserDashboardDTO.class),
                examples = @ExampleObject(
                    name = "Tableau de bord",
                    value = """
                    {
                        "departementId": 3,
                        "departementNom": "Département SI",
                        "annee": 2025,
                        "budgetTotal": 75000.0,
                        "budgetUtilise": 50000.0,
                        "budgetRestant": 25000.0,
                        "totalDepenses": 5,
                        "depensesValidees": 3,
                        "depensesEnAttente": 2,
                        "depensesRefusees": 0,
                        "pourcentageUtilisation": 66.67
                    }
                    """
                )
            )
        ),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public UserDashboardDTO getUserDashboard(
            @Parameter(description = "Année pour le tableau de bord (optionnel, défaut: année courante)")
            @RequestParam(value = "annee", required = false) Integer annee
    ) {
        return userService.getUserDashboard(annee);
    }

    // ==================== PROFILE MANAGEMENT ====================
    
    @GetMapping("/profile")
    @Operation(
        summary = "Profil utilisateur",
        description = "Récupère le profil de l'utilisateur connecté"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Profil récupéré avec succès",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserProfileDTO.class)
            )
        ),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public UserProfileDTO getUserProfile() {
        return userService.getUserProfile();
    }
    
    @PutMapping("/profile")
    @Operation(
        summary = "Mise à jour du profil",
        description = "Met à jour le profil de l'utilisateur connecté"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Profil mis à jour avec succès",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserProfileDTO.class)
            )
        ),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public UserProfileDTO updateUserProfile(@RequestBody UserProfileDTO profileDTO) {
        return userService.updateUserProfile(profileDTO);
    }
    
    @PutMapping("/password")
    @Operation(
        summary = "Changement de mot de passe",
        description = "Met à jour le mot de passe de l'utilisateur connecté"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Mot de passe mis à jour avec succès"),
        @ApiResponse(responseCode = "400", description = "Ancien mot de passe incorrect"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<String> updatePassword(@RequestBody PasswordUpdateRequestDTO request) {
        userService.updatePassword(request);
        return ResponseEntity.ok("Mot de passe mis à jour avec succès");
    }

    // ==================== PASSWORD MANAGEMENT ====================
    
    @PostMapping("/forgot-password")
    @Operation(
        summary = "Mot de passe oublié",
        description = "Envoie un email de réinitialisation de mot de passe"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Email de réinitialisation envoyé"),
        @ApiResponse(responseCode = "400", description = "Email non trouvé")
    })
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        userService.forgotPassword(request);
        return ResponseEntity.ok("Email de réinitialisation envoyé");
    }
    
    @PostMapping("/reset-password")
    @Operation(
        summary = "Réinitialisation de mot de passe",
        description = "Réinitialise le mot de passe avec un token de récupération"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Mot de passe réinitialisé avec succès"),
        @ApiResponse(responseCode = "400", description = "Token invalide ou expiré")
    })
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        userService.resetPassword(request);
        return ResponseEntity.ok("Mot de passe réinitialisé avec succès");
    }

    // ==================== EXPENSE MANAGEMENT ====================
    
    @GetMapping("/depenses")
    @Operation(
        summary = "Liste des dépenses du département",
        description = "Récupère toutes les dépenses du département de l'utilisateur connecté avec filtres optionnels"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Liste des dépenses récupérée avec succès",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DepenseDTO.class)
            )
        ),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public List<DepenseDTO> getUserDepartmentExpenses(
            @Parameter(description = "Année de filtrage (optionnel)")
            @RequestParam(value = "annee", required = false) Integer annee,
            @Parameter(description = "Statut de filtrage (EN_ATTENTE, VALIDEE, REFUSEE)")
            @RequestParam(value = "status", required = false) String status,
            @Parameter(description = "Prestataire de filtrage")
            @RequestParam(value = "prestataire", required = false) String prestataire
    ) {
        return userService.getUserDepartmentExpenses(annee, status, prestataire);
    }
    
    @GetMapping("/depenses/{id}")
    @Operation(
        summary = "Détails d'une dépense",
        description = "Récupère une dépense spécifique du département de l'utilisateur connecté"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Dépense récupérée avec succès",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DepenseDTO.class)
            )
        ),
        @ApiResponse(responseCode = "404", description = "Dépense non trouvée"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public DepenseDTO getUserDepartmentExpense(
            @Parameter(description = "ID de la dépense", required = true)
            @PathVariable Integer id
    ) {
        return userService.getUserDepartmentExpense(id);
    }
    
    @PostMapping("/depenses")
    @Operation(
        summary = "Création d'une dépense",
        description = "Crée une nouvelle dépense pour le département de l'utilisateur connecté"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Dépense créée avec succès",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DepenseDTO.class)
            )
        ),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public DepenseDTO createUserDepartmentExpense(@RequestBody DepenseDTO depenseDTO) {
        return userService.createUserDepartmentExpense(depenseDTO);
    }
    
    @PutMapping("/depenses/{id}")
    @Operation(
        summary = "Modification d'une dépense",
        description = "Met à jour une dépense du département de l'utilisateur connecté"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Dépense mise à jour avec succès",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DepenseDTO.class)
            )
        ),
        @ApiResponse(responseCode = "404", description = "Dépense non trouvée"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public DepenseDTO updateUserDepartmentExpense(
            @Parameter(description = "ID de la dépense", required = true)
            @PathVariable Integer id,
            @RequestBody DepenseDTO depenseDTO
    ) {
        return userService.updateUserDepartmentExpense(id, depenseDTO);
    }
    
    @DeleteMapping("/depenses/{id}")
    @Operation(
        summary = "Suppression d'une dépense",
        description = "Supprime une dépense du département de l'utilisateur connecté"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dépense supprimée avec succès"),
        @ApiResponse(responseCode = "404", description = "Dépense non trouvée"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<String> deleteUserDepartmentExpense(
            @Parameter(description = "ID de la dépense", required = true)
            @PathVariable Integer id
    ) {
        userService.deleteUserDepartmentExpense(id);
        return ResponseEntity.ok("Dépense supprimée avec succès");
    }

    // ==================== ANALYTICS ====================
    
    @GetMapping("/analytics")
    @Operation(
        summary = "Analytics du département",
        description = "Récupère les analytics et statistiques du département de l'utilisateur connecté"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Analytics récupérés avec succès",
            content = @Content(mediaType = "application/json")
        ),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public Object getUserDepartmentAnalytics(
            @Parameter(description = "Année pour les analytics (optionnel)")
            @RequestParam(value = "annee", required = false) Integer annee
    ) {
        return userService.getUserDepartmentAnalytics(annee);
    }
    
    @GetMapping("/prestataires")
    @Operation(
        summary = "Liste des prestataires",
        description = "Récupère la liste des prestataires du département de l'utilisateur connecté"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Liste des prestataires récupérée avec succès",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(type = "array")
            )
        ),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public List<String> getPrestataires() {
        return userService.getPrestataires();
    }
} 