package com.example.demo.controller;

import com.example.demo.dto.BudgetDTO;
import com.example.demo.dto.BudgetUpdateDTO;
import com.example.demo.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@Tag(name = "Budget", description = "API de gestion des budgets")
public class BudgetController {
    @Autowired
    private BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Liste tous les budgets")
    public List<BudgetDTO> getAll() {
        return budgetService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère un budget par son id")
    public BudgetDTO getById(@PathVariable Integer id) {
        return budgetService.findById(id);
    }

    @GetMapping("/annee/{annee}")
    @Operation(summary = "Récupère le budget d'une année spécifique")
    public BudgetDTO getByYear(@PathVariable Integer annee) {
        return budgetService.findByAnnee(annee);
    }

    @PostMapping
    @Operation(summary = "Crée un nouveau budget (ADMIN)")
    public BudgetDTO create(@RequestBody BudgetDTO budgetDTO) {
        return budgetService.save(budgetDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour un budget (ADMIN)")
    public BudgetDTO update(@PathVariable Integer id, @RequestBody BudgetUpdateDTO budgetUpdateDTO) {
        return budgetService.update(id, budgetUpdateDTO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime un budget (ADMIN)")
    public void delete(@PathVariable Integer id) {
        budgetService.delete(id);
    }
} 