package com.example.demo.controller;

import com.example.demo.dto.BudgetDTO;
import com.example.demo.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping
    @Operation(summary = "Crée un nouveau budget")
    public BudgetDTO create(@RequestBody BudgetDTO budgetDTO) {
        return budgetService.save(budgetDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour un budget")
    public BudgetDTO update(@PathVariable Integer id, @RequestBody BudgetDTO budgetDTO) {
        return budgetService.update(id, budgetDTO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime un budget")
    public void delete(@PathVariable Integer id) {
        budgetService.delete(id);
    }
} 