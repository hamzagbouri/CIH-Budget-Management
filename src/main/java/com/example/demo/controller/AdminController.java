package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "API d'administration - Accès réservé aux administrateurs")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ==================== DASHBOARD ANALYTICS ====================
    
    @GetMapping("/dashboard")
    @Operation(summary = "Tableau de bord administrateur", description = "Récupère toutes les analytics nécessaires pour l'admin")
    public ResponseEntity<AdminDashboardDTO> getAdminDashboard(
            @RequestParam(value = "annee", required = false) Integer annee) {
        AdminDashboardDTO dashboard = adminService.getAdminDashboard(annee);
        return ResponseEntity.ok(dashboard);
    }

    // ==================== BUDGET MANAGEMENT ====================
    
    @PostMapping("/budgets")
    @Operation(summary = "Ajouter un budget pour une année", description = "Ajoute un budget pour une année spécifique (une seule par année)")
    public ResponseEntity<BudgetDTO> addBudget(@RequestBody BudgetDTO budgetDTO) {
        BudgetDTO budget = adminService.addBudget(budgetDTO);
        return ResponseEntity.ok(budget);
    }

    @PutMapping("/budgets/{id}")
    @Operation(summary = "Modifier un budget", description = "Modifie un budget avec une raison obligatoire")
    public ResponseEntity<BudgetDTO> updateBudget(
            @PathVariable Integer id,
            @RequestBody BudgetUpdateDTO budgetUpdateDTO) {
        BudgetDTO budget = adminService.updateBudget(id, budgetUpdateDTO);
        return ResponseEntity.ok(budget);
    }

    @GetMapping("/budgets/annee/{annee}")
    @Operation(summary = "Récupérer le budget d'une année", description = "Récupère le budget pour une année spécifique")
    public ResponseEntity<BudgetDTO> getBudgetByYear(@PathVariable Integer annee) {
        BudgetDTO budget = adminService.getBudgetByYear(annee);
        return ResponseEntity.ok(budget);
    }

    // ==================== EXPENSE VALIDATION ====================
    
    @PutMapping("/depenses/{id}/validate")
    @Operation(summary = "Valider une dépense", description = "Valide une dépense (admin seulement)")
    public ResponseEntity<DepenseDTO> validateExpense(@PathVariable Integer id) {
        DepenseDTO depense = adminService.validateExpense(id);
        return ResponseEntity.ok(depense);
    }

    @PutMapping("/depenses/{id}/reject")
    @Operation(summary = "Rejeter une dépense", description = "Rejette une dépense (admin seulement)")
    public ResponseEntity<DepenseDTO> rejectExpense(@PathVariable Integer id) {
        DepenseDTO depense = adminService.rejectExpense(id);
        return ResponseEntity.ok(depense);
    }

    // ==================== DEPARTMENT ANALYTICS ====================
    
    @GetMapping("/departements/analytics")
    @Operation(summary = "Analytics par département", description = "Récupère les analytics pour chaque département")
    public ResponseEntity<List<DepartementAnalyticsDTO>> getDepartementsAnalytics(
            @RequestParam(value = "annee", required = false) Integer annee) {
        List<DepartementAnalyticsDTO> analytics = adminService.getDepartementsAnalytics(annee);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/departements/analytics/{departementId}")
    @Operation(summary = "Analytics d'un département", description = "Récupère les analytics pour un département spécifique")
    public ResponseEntity<DepartementAnalyticsDTO> getDepartementAnalytics(
            @PathVariable Integer departementId,
            @RequestParam(value = "annee", required = false) Integer annee) {
        DepartementAnalyticsDTO analytics = adminService.getDepartementAnalytics(departementId, annee);
        return ResponseEntity.ok(analytics);
    }

    // ==================== DEPARTMENT MANAGEMENT ====================
    
    @GetMapping("/departements/with-responsable")
    @Operation(summary = "Liste des départements avec responsable", description = "Récupère tous les départements avec leurs responsables et budgets")
    public ResponseEntity<List<DepartementWithResponsableDTO>> getDepartementsWithResponsable(
            @RequestParam(value = "annee", required = false) Integer annee) {
        List<DepartementWithResponsableDTO> departements = adminService.getDepartementsWithResponsable(annee);
        return ResponseEntity.ok(departements);
    }

    @PostMapping("/departements/with-responsable")
    @Operation(summary = "Ajouter un département avec responsable", description = "Ajoute un département avec son responsable")
    public ResponseEntity<DepartementWithResponsableDTO> addDepartementWithResponsable(
            @RequestBody CreateResponsableRequestDTO request) {
        DepartementWithResponsableDTO departement = adminService.addDepartementWithResponsable(request);
        return ResponseEntity.ok(departement);
    }

    // ==================== DEPARTMENT BUDGET MANAGEMENT ====================
    
    @PostMapping("/departements/{departementId}/budget")
    @Operation(summary = "Ajouter un budget à un département", description = "Ajoute un budget à un département pour une année")
    public ResponseEntity<BudgetDepartementDTO> addDepartementBudget(
            @PathVariable Integer departementId,
            @RequestBody BudgetDepartementDTO budgetDTO) {
        BudgetDepartementDTO budget = adminService.addDepartementBudget(departementId, budgetDTO);
        return ResponseEntity.ok(budget);
    }

    @PutMapping("/departements/{departementId}/budget")
    @Operation(summary = "Modifier le budget d'un département", description = "Modifie le budget d'un département avec une raison obligatoire")
    public ResponseEntity<BudgetDepartementDTO> updateDepartementBudget(
            @PathVariable Integer departementId,
            @RequestBody BudgetDepartementUpdateDTO budgetUpdateDTO) {
        BudgetDepartementDTO budget = adminService.updateDepartementBudget(departementId, budgetUpdateDTO);
        return ResponseEntity.ok(budget);
    }

    // ==================== BUDGET VALIDATION ====================
    
    @GetMapping("/budgets/validation/{annee}")
    @Operation(summary = "Valider les budgets de département", description = "Vérifie si la somme des budgets département ne dépasse pas le budget total")
    public ResponseEntity<Object> validateBudgets(@PathVariable Integer annee) {
        Object validation = adminService.validateBudgets(annee);
        return ResponseEntity.ok(validation);
    }
} 