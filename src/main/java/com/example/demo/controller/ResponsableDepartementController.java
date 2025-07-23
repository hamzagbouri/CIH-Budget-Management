package com.example.demo.controller;

import com.example.demo.dto.ResponsableDepartementDTO;
import com.example.demo.dto.CreateResponsableRequestDTO;
import com.example.demo.dto.CreateResponsableResponseDTO;
import com.example.demo.service.ResponsableDepartementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/responsables")
@Tag(name = "Responsable Département", description = "API de gestion des responsables de départements")
public class ResponsableDepartementController {
    
    @Autowired
    private ResponsableDepartementService responsableDepartementService;
    
    @GetMapping
    @Operation(summary = "Liste tous les responsables (actifs et inactifs)")
    public ResponseEntity<List<ResponsableDepartementDTO>> getAllResponsables() {
        System.out.println("=== ResponsableDepartementController.getAllResponsables() called ===");
        try {
            List<ResponsableDepartementDTO> responsables = responsableDepartementService.findAllResponsables();
            System.out.println("Found " + responsables.size() + " responsables");
            return ResponseEntity.ok(responsables);
        } catch (Exception e) {
            System.err.println("Error in getAllResponsables: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @GetMapping("/all")
    @Operation(summary = "Liste tous les responsables actifs (debug)")
    public ResponseEntity<List<ResponsableDepartementDTO>> getAllActiveResponsables() {
        System.out.println("=== ResponsableDepartementController.getAllActiveResponsables() called ===");
        List<ResponsableDepartementDTO> responsables = responsableDepartementService.findAllActive();
        System.out.println("Found " + responsables.size() + " active responsables");
        return ResponseEntity.ok(responsables);
    }
    
    @GetMapping("/all-responsables")
    @Operation(summary = "Liste tous les responsables (actifs et inactifs)")
    public ResponseEntity<List<ResponsableDepartementDTO>> getAllResponsablesWithDetails() {
        System.out.println("=== ResponsableDepartementController.getAllResponsablesWithDetails() called ===");
        List<ResponsableDepartementDTO> responsables = responsableDepartementService.findAllResponsables();
        System.out.println("Found " + responsables.size() + " all responsables");
        return ResponseEntity.ok(responsables);
    }
    
    @GetMapping("/test")
    @Operation(summary = "Test endpoint")
    public ResponseEntity<String> testEndpoint() {
        System.out.println("=== ResponsableDepartementController.testEndpoint() called ===");
        return ResponseEntity.ok("Test endpoint working! Authentication successful.");
    }
    
    @GetMapping("/annee/{annee}")
    @Operation(summary = "Liste tous les responsables pour une année donnée")
    public ResponseEntity<List<ResponsableDepartementDTO>> getResponsablesByAnnee(@PathVariable Integer annee) {
        List<ResponsableDepartementDTO> responsables = responsableDepartementService.findByAnnee(annee);
        return ResponseEntity.ok(responsables);
    }
    
    @GetMapping("/departement/{departementId}")
    @Operation(summary = "Liste tous les responsables actifs d'un département")
    public ResponseEntity<List<ResponsableDepartementDTO>> getResponsablesByDepartement(@PathVariable Integer departementId) {
        List<ResponsableDepartementDTO> responsables = responsableDepartementService.findByDepartementId(departementId);
        return ResponseEntity.ok(responsables);
    }
    
    @GetMapping("/departement/{departementId}/all")
    @Operation(summary = "Liste tous les responsables d'un département (actifs et inactifs)")
    public ResponseEntity<List<ResponsableDepartementDTO>> getAllResponsablesByDepartement(@PathVariable Integer departementId) {
        List<ResponsableDepartementDTO> responsables = responsableDepartementService.findAllByDepartementId(departementId);
        return ResponseEntity.ok(responsables);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Récupère un responsable par son id")
    public ResponseEntity<ResponsableDepartementDTO> getResponsableById(@PathVariable Integer id) {
        ResponsableDepartementDTO responsable = responsableDepartementService.findById(id);
        if (responsable != null) {
            return ResponseEntity.ok(responsable);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    @Operation(summary = "Crée un nouveau responsable avec génération automatique du mot de passe et envoi par email")
    public ResponseEntity<CreateResponsableResponseDTO> createResponsable(@RequestBody CreateResponsableRequestDTO request) {
        try {
            CreateResponsableResponseDTO response = responsableDepartementService.createResponsable(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Met à jour un responsable")
    public ResponseEntity<ResponsableDepartementDTO> updateResponsable(@PathVariable Integer id, @RequestBody ResponsableDepartementDTO dto) {
        try {
            ResponsableDepartementDTO updated = responsableDepartementService.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime définitivement un responsable")
    public ResponseEntity<Void> deleteResponsable(@PathVariable Integer id) {
        try {
            responsableDepartementService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Désactive un responsable (soft delete)")
    public ResponseEntity<Void> deactivateResponsable(@PathVariable Integer id) {
        try {
            responsableDepartementService.deactivate(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 