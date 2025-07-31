package com.example.demo.controller;

import com.example.demo.dto.DepenseDTO;
import com.example.demo.service.DepenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/depenses")
@Tag(name = "Depense", description = "API de gestion des dépenses")
public class DepenseController {
    @Autowired
    private DepenseService depenseService;

    @GetMapping
    @Operation(summary = "Liste toutes les dépenses, filtrable par département, année, status")
    public List<DepenseDTO> getAllFiltered(
            @RequestParam(value = "departementId", required = false) Integer departementId,
            @RequestParam(value = "annee", required = false) Integer annee,
            @RequestParam(value = "status", required = false) String status
    ) {
        return depenseService.findAllFiltered(departementId, annee, status);
    }

    @GetMapping("/my-departement")
    @Operation(summary = "Liste les dépenses du département de l'utilisateur connecté pour l'année courante (ou annee/status si précisé)")
    public List<DepenseDTO> getMyDepartementDepenses(
            @RequestParam(value = "annee", required = false) Integer annee,
            @RequestParam(value = "status", required = false) String status
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return depenseService.findForCurrentUserDepartement(email, annee, status);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère une dépense par son id")
    public DepenseDTO getById(@PathVariable Integer id) {
        return depenseService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Crée une nouvelle dépense")
    public DepenseDTO create(@RequestBody DepenseDTO depenseDTO) {
        // Status is always set to EN_ATTENTE in service
        return depenseService.save(depenseDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour une dépense")
    public DepenseDTO update(@PathVariable Integer id, @RequestBody DepenseDTO depenseDTO) {
        return depenseService.update(id, depenseDTO);
    }

    @PutMapping("/{id}/validate")
    @Operation(summary = "Valide une dépense (ADMIN)")
    public DepenseDTO validateDepense(@PathVariable Integer id) {
        return depenseService.validateDepense(id);
    }

    @PutMapping("/{id}/invalidate")
    @Operation(summary = "Invalide une dépense (ADMIN)")
    public DepenseDTO invalidateDepense(@PathVariable Integer id) {
        return depenseService.invalidateDepense(id);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Liste les dépenses par status")
    public List<DepenseDTO> getByStatus(@PathVariable String status) {
        return depenseService.findByStatus(status);
    }

    @GetMapping("/departement/{departementId}/status/{status}")
    @Operation(summary = "Liste les dépenses d'un département par status")
    public List<DepenseDTO> getByDepartementAndStatus(@PathVariable Integer departementId, @PathVariable String status) {
        return depenseService.findByDepartementAndStatus(departementId, status);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime une dépense")
    public void delete(@PathVariable Integer id) {
        depenseService.delete(id);
    }
    
    @GetMapping("/remaining-budget/{departementId}/{year}")
    @Operation(summary = "Récupère le budget restant pour un département dans une année spécifique")
    public Float getRemainingBudget(@PathVariable Integer departementId, @PathVariable Integer year) {
        return depenseService.getRemainingBudget(departementId, year);
    }
} 