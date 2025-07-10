package com.example.demo.dto;
import lombok.Data;

@Data
public class UtilisateurDTO {
    private Integer id;
    private String nom;
    private String email;
    private String role;
    private String matricule;
    private Integer departementId;
    // getters & setters
} 