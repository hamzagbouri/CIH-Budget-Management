package com.example.demo.dto;

import lombok.Data;

@Data
public class BudgetDepartementDTO {
    private Integer id;
    private Integer annee;
    private Float montant;
    private Integer departementId;
    // getters & setters
} 