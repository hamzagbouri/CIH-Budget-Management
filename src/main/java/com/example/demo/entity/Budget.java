package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.List;
import lombok.Data;

@Data
@Entity
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer annee;
    private Float montant;

    @OneToMany(mappedBy = "budget")
    private List<BudgetDepartement> budgetDepartements;

    // getters & setters
 
} 