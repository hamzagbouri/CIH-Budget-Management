package com.example.demo.dto;

import lombok.Data;

@Data
public class BudgetDepartementDTO {
    private Integer id;
    private Integer annee;
    private Float montant;
    private Integer departementId;
    private String description;
    private Float totalBudget;
    private Float usedBudget;
    private Float remainingBudget;
} 