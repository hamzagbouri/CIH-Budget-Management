package com.example.demo.dto;

import lombok.Data;

@Data
public class BudgetDepartementUpdateDTO {
    private Float montant;
    private String description; // Reason for modification (mandatory)
    private Integer annee; // Year for the budget
} 