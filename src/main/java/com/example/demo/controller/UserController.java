package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User", description = "API pour les utilisateurs (responsables département)")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // ==================== DASHBOARD ====================
    
    @GetMapping("/dashboard")
    @Operation(summary = "Récupère le tableau de bord de l'utilisateur connecté")
    public UserDashboardDTO getUserDashboard(
            @RequestParam(value = "annee", required = false) Integer annee
    ) {
        return userService.getUserDashboard(annee);
    }

    // ==================== PROFILE MANAGEMENT ====================
    
    @GetMapping("/profile")
    @Operation(summary = "Récupère le profil de l'utilisateur connecté")
    public UserProfileDTO getUserProfile() {
        return userService.getUserProfile();
    }
    
    @PutMapping("/profile")
    @Operation(summary = "Met à jour le profil de l'utilisateur connecté")
    public UserProfileDTO updateUserProfile(@RequestBody UserProfileDTO profileDTO) {
        return userService.updateUserProfile(profileDTO);
    }
    
    @PutMapping("/password")
    @Operation(summary = "Met à jour le mot de passe de l'utilisateur connecté")
    public ResponseEntity<String> updatePassword(@RequestBody PasswordUpdateRequestDTO request) {
        userService.updatePassword(request);
        return ResponseEntity.ok("Mot de passe mis à jour avec succès");
    }

    // ==================== PASSWORD MANAGEMENT ====================
    
    @PostMapping("/forgot-password")
    @Operation(summary = "Demande de réinitialisation de mot de passe")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        userService.forgotPassword(request);
        return ResponseEntity.ok("Email de réinitialisation envoyé");
    }
    
    @PostMapping("/reset-password")
    @Operation(summary = "Réinitialise le mot de passe avec un token")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        userService.resetPassword(request);
        return ResponseEntity.ok("Mot de passe réinitialisé avec succès");
    }

    // ==================== EXPENSE MANAGEMENT ====================
    
    @GetMapping("/depenses")
    @Operation(summary = "Récupère toutes les dépenses du département de l'utilisateur connecté")
    public List<DepenseDTO> getUserDepartmentExpenses(
            @RequestParam(value = "annee", required = false) Integer annee,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "prestataire", required = false) String prestataire
    ) {
        return userService.getUserDepartmentExpenses(annee, status, prestataire);
    }
    
    @GetMapping("/depenses/{id}")
    @Operation(summary = "Récupère une dépense spécifique du département de l'utilisateur connecté")
    public DepenseDTO getUserDepartmentExpense(@PathVariable Integer id) {
        return userService.getUserDepartmentExpense(id);
    }
    
    @PostMapping("/depenses")
    @Operation(summary = "Crée une nouvelle dépense pour le département de l'utilisateur connecté")
    public DepenseDTO createUserDepartmentExpense(@RequestBody DepenseDTO depenseDTO) {
        return userService.createUserDepartmentExpense(depenseDTO);
    }
    
    @PutMapping("/depenses/{id}")
    @Operation(summary = "Met à jour une dépense du département de l'utilisateur connecté")
    public DepenseDTO updateUserDepartmentExpense(@PathVariable Integer id, @RequestBody DepenseDTO depenseDTO) {
        return userService.updateUserDepartmentExpense(id, depenseDTO);
    }
    
    @DeleteMapping("/depenses/{id}")
    @Operation(summary = "Supprime une dépense du département de l'utilisateur connecté")
    public ResponseEntity<String> deleteUserDepartmentExpense(@PathVariable Integer id) {
        userService.deleteUserDepartmentExpense(id);
        return ResponseEntity.ok("Dépense supprimée avec succès");
    }

    // ==================== ANALYTICS ====================
    
    @GetMapping("/analytics")
    @Operation(summary = "Récupère les analytics du département de l'utilisateur connecté")
    public Object getUserDepartmentAnalytics(
            @RequestParam(value = "annee", required = false) Integer annee
    ) {
        return userService.getUserDepartmentAnalytics(annee);
    }
    
    @GetMapping("/prestataires")
    @Operation(summary = "Récupère la liste des prestataires du département de l'utilisateur connecté")
    public List<String> getPrestataires() {
        return userService.getPrestataires();
    }
} 