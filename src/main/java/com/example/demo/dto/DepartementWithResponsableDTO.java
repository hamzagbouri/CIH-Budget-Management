package com.example.demo.dto;

import lombok.Data;

@Data
public class DepartementWithResponsableDTO {
    private Integer id;
    private String nom;
    private String responsableNom;
    private String responsableEmail;
    private String responsableMatricule;
    private Float budgetTotal;
    private Float budgetRestant;
    private Integer annee;
} 