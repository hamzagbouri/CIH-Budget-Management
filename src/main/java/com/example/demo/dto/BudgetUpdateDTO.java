package com.example.demo.dto;

import lombok.Data;

@Data
public class BudgetUpdateDTO {
    private Float montant;
    private String description; // Reason for modification (mandatory)
} 