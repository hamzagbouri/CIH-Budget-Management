package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class BudgetDepartement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "departement_id")
    private Departement departement;

    @ManyToOne
    @JoinColumn(name = "budget_id")
    private Budget budget;

    // getters & setters
} 