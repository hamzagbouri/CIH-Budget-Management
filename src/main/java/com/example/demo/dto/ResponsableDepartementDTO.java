package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ResponsableDepartementDTO {
    private Integer id;
    private Integer annee;
    private Integer utilisateurId;
    private String utilisateurNom;
    private String utilisateurEmail;
    private String utilisateurMatricule;
    private Integer departementId;
    private String departementNom;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private String utilisateurModification;
    private Boolean actif;
    private String raisonModification;
} 