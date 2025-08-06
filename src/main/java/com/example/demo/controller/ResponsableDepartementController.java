package com.example.demo.controller;

import com.example.demo.dto.ResponsableDepartementDTO;
import com.example.demo.dto.CreateResponsableRequestDTO;
import com.example.demo.dto.CreateResponsableResponseDTO;
import com.example.demo.entity.ResponsableDepartement;
import com.example.demo.repository.ResponsableDepartementRepository;
import com.example.demo.service.ResponsableDepartementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/responsables")
@Tag(name = "Responsable Departement", description = "API pour la gestion des responsables de département")
@CrossOrigin(origins = "*")
public class ResponsableDepartementController {
    
    private static final Logger logger = LoggerFactory.getLogger(ResponsableDepartementController.class);
    
    @Autowired
    private ResponsableDepartementService responsableDepartementService;
    
    @Autowired
    private ResponsableDepartementRepository responsableDepartementRepository;
    
    // Basic CRUD endpoints
    @GetMapping
    @Operation(summary = "Récupérer tous les responsables", description = "Récupère la liste de tous les responsables")
    public ResponseEntity<List<ResponsableDepartementDTO>> getAllResponsables() {
        List<ResponsableDepartementDTO> responsables = responsableDepartementService.findAll();
        return ResponseEntity.ok(responsables);
    }
    
    @GetMapping("/active")
    @Operation(summary = "Récupérer tous les responsables actifs", description = "Récupère la liste de tous les responsables actifs")
    public ResponseEntity<List<ResponsableDepartementDTO>> getAllActiveResponsables() {
        List<ResponsableDepartementDTO> responsables = responsableDepartementService.findAllActive();
        return ResponseEntity.ok(responsables);
    }
    
    @GetMapping("/all")
    @Operation(summary = "Récupérer tous les responsables avec détails", description = "Récupère la liste complète de tous les responsables")
    public ResponseEntity<List<ResponsableDepartementDTO>> getAllResponsablesWithDetails() {
        List<ResponsableDepartementDTO> responsables = responsableDepartementService.findAllResponsables();
        return ResponseEntity.ok(responsables);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un responsable par ID", description = "Récupère un responsable spécifique par son ID")
    public ResponseEntity<ResponsableDepartementDTO> getResponsableById(@PathVariable Integer id) {
        ResponsableDepartementDTO responsable = responsableDepartementService.findById(id);
        return ResponseEntity.ok(responsable);
    }
    
    @PostMapping
    @Operation(summary = "Créer un nouveau responsable", description = "Crée un nouveau responsable avec un utilisateur")
    public ResponseEntity<CreateResponsableResponseDTO> createResponsable(@RequestBody CreateResponsableRequestDTO request) {
        CreateResponsableResponseDTO response = responsableDepartementService.createResponsable(request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un responsable", description = "Met à jour un responsable existant, y compris le changement de département")
    public ResponseEntity<ResponsableDepartementDTO> updateResponsable(@PathVariable Integer id, @RequestBody ResponsableDepartementDTO dto) {
        logger.info("=== DEBUG: updateResponsable called for ID: " + id + " ===");
        logger.info("=== DEBUG: Request DTO: " + dto.toString() + " ===");
        
        try {
            ResponsableDepartementDTO updated = responsableDepartementService.update(id, dto);
            logger.info("=== DEBUG: updateResponsable completed successfully ===");
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.error("=== ERROR in updateResponsable ===");
            logger.error("Error message: " + e.getMessage());
            logger.error("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            logger.error("=== UNEXPECTED ERROR in updateResponsable ===");
            logger.error("Error message: " + e.getMessage());
            logger.error("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un responsable", description = "Supprime un responsable (soft delete)")
    public ResponseEntity<Void> deleteResponsable(@PathVariable Integer id) {
        responsableDepartementService.delete(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Désactiver un responsable", description = "Désactive un responsable sans le supprimer")
    public ResponseEntity<Void> deactivateResponsable(@PathVariable Integer id) {
        responsableDepartementService.deactivate(id);
        return ResponseEntity.ok().build();
    }
    
    // Enhanced query endpoints
    @GetMapping("/annee/{annee}")
    @Operation(summary = "Récupérer les responsables par année", description = "Récupère tous les responsables pour une année donnée")
    public ResponseEntity<List<ResponsableDepartementDTO>> getResponsablesByAnnee(@PathVariable Integer annee) {
        List<ResponsableDepartementDTO> responsables = responsableDepartementService.findByAnnee(annee);
        return ResponseEntity.ok(responsables);
    }
    
    @GetMapping("/departement/{departementId}")
    @Operation(summary = "Récupérer les responsables par département", description = "Récupère tous les responsables actifs d'un département")
    public ResponseEntity<List<ResponsableDepartementDTO>> getResponsablesByDepartement(@PathVariable Integer departementId) {
        List<ResponsableDepartementDTO> responsables = responsableDepartementService.findByDepartementId(departementId);
        return ResponseEntity.ok(responsables);
    }
    
    @GetMapping("/departement/{departementId}/history")
    @Operation(summary = "Historique des responsables d'un département", description = "Récupère l'historique complet des responsables d'un département")
    public ResponseEntity<List<ResponsableDepartementDTO>> getDepartementHistory(@PathVariable Integer departementId) {
        List<ResponsableDepartementDTO> history = responsableDepartementService.getDepartementHistory(departementId);
        return ResponseEntity.ok(history);
    }
    
    // New endpoints to fix identified bugs
    @PostMapping("/reassign")
    @Operation(summary = "Réassigner un responsable", description = "Réassigne un utilisateur comme responsable d'un département")
    public ResponseEntity<ResponsableDepartementDTO> reassignResponsable(
            @RequestParam Integer departementId,
            @RequestParam Integer newUserId,
            @RequestParam Integer annee,
            @RequestParam String modifiedBy,
            @RequestParam(required = false, defaultValue = "Réassignation") String reason) {
        
        ResponsableDepartementDTO result = responsableDepartementService.reassignResponsable(
                departementId, newUserId, annee, modifiedBy, reason);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/change")
    @Operation(summary = "Changer le responsable d'un département", description = "Change le responsable d'un département pour une année donnée")
    public ResponseEntity<ResponsableDepartementDTO> changeDepartementResponsable(
            @RequestParam Integer departementId,
            @RequestParam Integer newUserId,
            @RequestParam Integer annee,
            @RequestParam String modifiedBy,
            @RequestParam(required = false, defaultValue = "Changement de responsable") String reason) {
        
        ResponsableDepartementDTO result = responsableDepartementService.changeDepartementResponsable(
                departementId, newUserId, annee, modifiedBy, reason);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/user/{userId}/assignments")
    @Operation(summary = "Assignations d'un utilisateur", description = "Récupère toutes les assignations actives d'un utilisateur")
    public ResponseEntity<List<ResponsableDepartementDTO>> getUserAssignments(@PathVariable Integer userId) {
        List<ResponsableDepartementDTO> assignments = responsableDepartementService.getUserAssignments(userId);
        return ResponseEntity.ok(assignments);
    }
    
    @GetMapping("/departement/{departementId}/annee/{annee}/current")
    @Operation(summary = "Responsable actuel d'un département", description = "Récupère le responsable actuel d'un département pour une année")
    public ResponseEntity<ResponsableDepartementDTO> getCurrentResponsable(
            @PathVariable Integer departementId, @PathVariable Integer annee) {
        ResponsableDepartementDTO responsable = responsableDepartementService.getCurrentResponsable(departementId, annee);
        return ResponseEntity.ok(responsable);
    }
    
    // Validation endpoints
    @GetMapping("/validate/user/{userId}/annee/{annee}")
    @Operation(summary = "Valider si un utilisateur peut être responsable", description = "Vérifie si un utilisateur peut être assigné comme responsable")
    public ResponseEntity<Boolean> canUserBeResponsable(@PathVariable Integer userId, @PathVariable Integer annee) {
        boolean canBeResponsable = responsableDepartementService.canUserBeResponsable(userId, annee);
        return ResponseEntity.ok(canBeResponsable);
    }
    
    // Pagination endpoints
    @GetMapping("/active/paginated")
    @Operation(summary = "Responsables actifs avec pagination", description = "Récupère les responsables actifs avec pagination")
    public ResponseEntity<Page<ResponsableDepartementDTO>> getActiveResponsablesWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        System.out.println("=== DEBUG: getActiveResponsablesWithPagination called ===");
        System.out.println("Page: " + page + ", Size: " + size);
        logger.info("=== DEBUG: getActiveResponsablesWithPagination called ===");
        logger.info("Page: " + page + ", Size: " + size);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            System.out.println("=== DEBUG: Pageable created successfully ===");
            logger.info("=== DEBUG: Pageable created successfully ===");
            
            Page<ResponsableDepartementDTO> responsables = responsableDepartementService.findAllActiveWithPagination(pageable);
            System.out.println("=== DEBUG: Service call successful, found " + responsables.getTotalElements() + " elements ===");
            logger.info("=== DEBUG: Service call successful, found " + responsables.getTotalElements() + " elements ===");
            
            return ResponseEntity.ok(responsables);
        } catch (Exception e) {
            System.err.println("=== ERROR in getActiveResponsablesWithPagination ===");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            logger.error("=== ERROR in getActiveResponsablesWithPagination ===");
            logger.error("Error message: " + e.getMessage());
            logger.error("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @GetMapping("/annee/{annee}/paginated")
    @Operation(summary = "Responsables par année avec pagination", description = "Récupère les responsables d'une année avec pagination")
    public ResponseEntity<Page<ResponsableDepartementDTO>> getResponsablesByAnneeWithPagination(
            @PathVariable Integer annee,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ResponsableDepartementDTO> responsables = responsableDepartementService.findByAnneeWithPagination(annee, pageable);
        return ResponseEntity.ok(responsables);
    }
    
    // Audit endpoints
    @GetMapping("/audit/user/{utilisateurModification}")
    @Operation(summary = "Modifications par utilisateur", description = "Récupère toutes les modifications effectuées par un utilisateur")
    public ResponseEntity<List<ResponsableDepartementDTO>> getModificationsByUser(@PathVariable String utilisateurModification) {
        List<ResponsableDepartementDTO> modifications = responsableDepartementService.findModificationsByUser(utilisateurModification);
        return ResponseEntity.ok(modifications);
    }
    
    @GetMapping("/audit/dates")
    @Operation(summary = "Modifications entre dates", description = "Récupère toutes les modifications entre deux dates")
    public ResponseEntity<List<ResponsableDepartementDTO>> getModificationsBetweenDates(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        List<ResponsableDepartementDTO> modifications = responsableDepartementService.findModificationsBetweenDates(start, end);
        return ResponseEntity.ok(modifications);
    }
    
    // Test endpoint
    @GetMapping("/test")
    @Operation(summary = "Test endpoint", description = "Endpoint de test pour vérifier le fonctionnement")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("ResponsableDepartementController fonctionne correctement!");
    }

    // Temporary endpoint for testing (works without audit fields)
    @GetMapping("/active/simple")
    @Operation(summary = "Responsables actifs simple", description = "Récupère les responsables actifs sans pagination (temporaire)")
    public ResponseEntity<List<ResponsableDepartementDTO>> getActiveResponsablesSimple() {
        List<ResponsableDepartementDTO> responsables = responsableDepartementService.findAllActive();
        return ResponseEntity.ok(responsables);
    }

    // Simple working endpoint (no audit fields)
    @GetMapping("/simple")
    @Operation(summary = "Responsables simples", description = "Récupère les responsables sans les nouveaux champs d'audit")
    public ResponseEntity<List<ResponsableDepartementDTO>> getResponsablesSimple() {
        try {
            List<ResponsableDepartement> responsables = responsableDepartementRepository.findAllActive();
            List<ResponsableDepartementDTO> dtos = responsables.stream()
                .map(rd -> {
                    ResponsableDepartementDTO dto = new ResponsableDepartementDTO();
                    dto.setId(rd.getId());
                    dto.setAnnee(rd.getAnnee());
                    dto.setUtilisateurId(rd.getUtilisateur().getId());
                    dto.setUtilisateurNom(rd.getUtilisateur().getNom());
                    dto.setUtilisateurEmail(rd.getUtilisateur().getEmail());
                    dto.setUtilisateurMatricule(rd.getUtilisateur().getMatricule());
                    dto.setDepartementId(rd.getDepartement().getId());
                    dto.setDepartementNom(rd.getDepartement().getNom());
                    dto.setDateCreation(rd.getDateCreation());
                    dto.setActif(rd.getActif());
                    // Don't set the new audit fields to avoid null pointer issues
                    return dto;
                })
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Simple pagination endpoint (no audit fields)
    @GetMapping("/simple/paginated")
    @Operation(summary = "Responsables simples avec pagination", description = "Récupère les responsables avec pagination sans les nouveaux champs d'audit")
    public ResponseEntity<Page<ResponsableDepartementDTO>> getResponsablesSimplePaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ResponsableDepartement> responsablesPage = responsableDepartementRepository.findByActifTrue(pageable);
            
            Page<ResponsableDepartementDTO> dtosPage = responsablesPage.map(rd -> {
                ResponsableDepartementDTO dto = new ResponsableDepartementDTO();
                dto.setId(rd.getId());
                dto.setAnnee(rd.getAnnee());
                dto.setUtilisateurId(rd.getUtilisateur().getId());
                dto.setUtilisateurNom(rd.getUtilisateur().getNom());
                dto.setUtilisateurEmail(rd.getUtilisateur().getEmail());
                dto.setUtilisateurMatricule(rd.getUtilisateur().getMatricule());
                dto.setDepartementId(rd.getDepartement().getId());
                dto.setDepartementNom(rd.getDepartement().getNom());
                dto.setDateCreation(rd.getDateCreation());
                dto.setActif(rd.getActif());
                // Don't set the new audit fields to avoid null pointer issues
                return dto;
            });
            
            return ResponseEntity.ok(dtosPage);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Debug endpoint to test basic repository functionality
    @GetMapping("/debug/test")
    @Operation(summary = "Debug test endpoint", description = "Tests basic repository functionality")
    public ResponseEntity<String> debugTest() {
        System.out.println("=== DEBUG: debugTest endpoint called ===");
        logger.info("=== DEBUG: debugTest endpoint called ===");
        try {
            // Test basic repository method
            List<ResponsableDepartement> allResponsables = responsableDepartementRepository.findAll();
            System.out.println("=== DEBUG: findAll() successful, found " + allResponsables.size() + " records ===");
            logger.info("=== DEBUG: findAll() successful, found " + allResponsables.size() + " records ===");
            
            // Test the specific method
            List<ResponsableDepartement> activeResponsables = responsableDepartementRepository.findAllActive();
            System.out.println("=== DEBUG: findAllActive() successful, found " + activeResponsables.size() + " records ===");
            logger.info("=== DEBUG: findAllActive() successful, found " + activeResponsables.size() + " records ===");
            
            return ResponseEntity.ok("Debug test successful. Found " + allResponsables.size() + " total records and " + activeResponsables.size() + " active records.");
        } catch (Exception e) {
            System.err.println("=== ERROR in debugTest ===");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            logger.error("=== ERROR in debugTest ===");
            logger.error("Error message: " + e.getMessage());
            logger.error("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Debug test failed: " + e.getMessage());
        }
    }

    // Simple endpoint without audit fields
    @GetMapping("/debug/simple")
    @Operation(summary = "Simple debug endpoint", description = "Tests basic functionality without audit fields")
    public ResponseEntity<List<ResponsableDepartementDTO>> debugSimple() {
        logger.debug("=== DEBUG: debugSimple endpoint called ===");
        try {
            List<ResponsableDepartement> responsables = responsableDepartementRepository.findAllActive();
            logger.debug("=== DEBUG: Found " + responsables.size() + " active responsables ===");
            
            List<ResponsableDepartementDTO> dtos = responsables.stream()
                .map(rd -> {
                    ResponsableDepartementDTO dto = new ResponsableDepartementDTO();
                    dto.setId(rd.getId());
                    dto.setAnnee(rd.getAnnee());
                    dto.setUtilisateurId(rd.getUtilisateur().getId());
                    dto.setUtilisateurNom(rd.getUtilisateur().getNom());
                    dto.setUtilisateurEmail(rd.getUtilisateur().getEmail());
                    dto.setUtilisateurMatricule(rd.getUtilisateur().getMatricule());
                    dto.setDepartementId(rd.getDepartement().getId());
                    dto.setDepartementNom(rd.getDepartement().getNom());
                    dto.setDateCreation(rd.getDateCreation());
                    dto.setActif(rd.getActif());
                    // Don't set audit fields to avoid null pointer issues
                    return dto;
                })
                .collect(Collectors.toList());
            
            logger.debug("=== DEBUG: Successfully created " + dtos.size() + " DTOs ===");
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("=== ERROR in debugSimple ===");
            logger.error("Error message: " + e.getMessage());
            logger.error("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
} 