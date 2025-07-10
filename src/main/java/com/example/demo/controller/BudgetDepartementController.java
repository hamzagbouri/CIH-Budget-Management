package com.example.demo.controller;

import com.example.demo.dto.BudgetDepartementDTO;
import com.example.demo.service.BudgetDepartementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budget-departements")
@Tag(name = "BudgetDepartement", description = "API de gestion des budgets par département")
public class BudgetDepartementController {
    @Autowired
    private BudgetDepartementService budgetDepartementService;

    @GetMapping
    @Operation(summary = "Liste tous les budgets par département")
    public List<BudgetDepartementDTO> getAll() {
        return budgetDepartementService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère un budget-département par son id")
    public BudgetDepartementDTO getById(@PathVariable Integer id) {
        return budgetDepartementService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Crée un nouveau budget-département")
    public BudgetDepartementDTO create(@RequestBody BudgetDepartementDTO budgetDepartementDTO) {
        return budgetDepartementService.save(budgetDepartementDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour un budget-département")
    public BudgetDepartementDTO update(@PathVariable Integer id, @RequestBody BudgetDepartementDTO budgetDepartementDTO) {
        return budgetDepartementService.update(id, budgetDepartementDTO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime un budget-département")
    public void delete(@PathVariable Integer id) {
        budgetDepartementService.delete(id);
    }
} 