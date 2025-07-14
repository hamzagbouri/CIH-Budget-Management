package com.example.demo.controller;

import com.example.demo.dto.DepenseDTO;
import com.example.demo.service.DepenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/depenses")
@Tag(name = "Depense", description = "API de gestion des dépenses")
public class DepenseController {
    @Autowired
    private DepenseService depenseService;

    @GetMapping
    @Operation(summary = "Liste toutes les dépenses")
    public List<DepenseDTO> getAll() {
        return depenseService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère une dépense par son id")
    public DepenseDTO getById(@PathVariable Integer id) {
        return depenseService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Crée une nouvelle dépense")
    public DepenseDTO create(@RequestBody DepenseDTO depenseDTO) {
        return depenseService.save(depenseDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour une dépense")
    public DepenseDTO update(@PathVariable Integer id, @RequestBody DepenseDTO depenseDTO) {
        return depenseService.update(id, depenseDTO);
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