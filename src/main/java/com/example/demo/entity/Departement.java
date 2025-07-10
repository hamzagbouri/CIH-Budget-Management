package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.List;
import lombok.Data;

@Data
@Entity
public class Departement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String nom;

    @OneToMany(mappedBy = "departement")
    private List<Utilisateur> utilisateurs;

    @OneToMany(mappedBy = "departement")
    private List<BudgetDepartement> budgetDepartements;

    @OneToMany(mappedBy = "departement")
    private List<Depense> depenses;

    // getters & setters
} 