package com.example.demo.controller;

import com.example.demo.dto.DepartementDTO;
import com.example.demo.service.DepartementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/departements")
@Tag(name = "Departement", description = "API de gestion des départements")
public class DepartementController {
    @Autowired
    private DepartementService departementService;

    @GetMapping
    @Operation(summary = "Liste tous les départements")
    public List<DepartementDTO> getAll() {
        return departementService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère un département par son id")
    public DepartementDTO getById(@PathVariable Integer id) {
        return departementService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Crée un nouveau département")
    public DepartementDTO create(@RequestBody DepartementDTO departementDTO) {
        return departementService.save(departementDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour un département")
    public DepartementDTO update(@PathVariable Integer id, @RequestBody DepartementDTO departementDTO) {
        return departementService.update(id, departementDTO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime un département")
    public void delete(@PathVariable Integer id) {
        departementService.delete(id);
    }
} 