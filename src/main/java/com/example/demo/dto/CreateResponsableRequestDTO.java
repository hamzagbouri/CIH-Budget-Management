package com.example.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

public class CreateResponsableRequestDTO {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;
    
    @NotBlank(message = "Le matricule est obligatoire")
    private String matricule;
    
    @NotNull(message = "L'ID du département est obligatoire")
    private Integer departementId;
    
    @NotNull(message = "L'année est obligatoire")
    @Min(value = 2020, message = "L'année doit être au moins 2020")
    @Max(value = 2030, message = "L'année ne peut pas dépasser 2030")
    private Integer annee;

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMatricule() {
        return matricule;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

    public Integer getDepartementId() {
        return departementId;
    }

    public void setDepartementId(Integer departementId) {
        this.departementId = departementId;
    }

    public Integer getAnnee() {
        return annee;
    }

    public void setAnnee(Integer annee) {
        this.annee = annee;
    }
} 