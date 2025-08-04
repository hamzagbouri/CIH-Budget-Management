package com.example.demo.dto;

import lombok.Data;

@Data
public class DepartementAnalyticsDTO {
    private Integer departementId;
    private String departementNom;
    private String responsableNom;
    private String responsableEmail;
    private Float budgetTotal;
    private Float budgetUtilise;
    private Float budgetRestant;
    private Integer totalDepenses;
    private Integer depensesValidees;
    private Integer depensesEnAttente;
    private Integer depensesRefusees;
    private Float pourcentageUtilisation;
} 