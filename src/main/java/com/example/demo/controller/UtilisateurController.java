package com.example.demo.controller;

import com.example.demo.dto.UtilisateurDTO;
import com.example.demo.service.UtilisateurService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@Tag(name = "Utilisateur", description = "API de gestion des utilisateurs")
public class UtilisateurController {
    @Autowired
    private UtilisateurService utilisateurService;

    @GetMapping
    @Operation(summary = "Liste tous les utilisateurs")
    public List<UtilisateurDTO> getAll() {
        return utilisateurService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère un utilisateur par son id")
    public UtilisateurDTO getById(@PathVariable Integer id) {
        return utilisateurService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Crée un nouvel utilisateur")
    public UtilisateurDTO create(@RequestBody UtilisateurDTO utilisateurDTO) {
        return utilisateurService.save(utilisateurDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour un utilisateur")
    public UtilisateurDTO update(@PathVariable Integer id, @RequestBody UtilisateurDTO utilisateurDTO) {
        return utilisateurService.update(id, utilisateurDTO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime un utilisateur")
    public void delete(@PathVariable Integer id) {
        utilisateurService.delete(id);
    }
} 