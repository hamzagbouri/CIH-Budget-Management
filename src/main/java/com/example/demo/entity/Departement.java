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

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public List<Utilisateur> getUtilisateurs() {
        return utilisateurs;
    }

    public void setUtilisateurs(List<Utilisateur> utilisateurs) {
        this.utilisateurs = utilisateurs;
    }

    public List<BudgetDepartement> getBudgetDepartements() {
        return budgetDepartements;
    }

    public void setBudgetDepartements(List<BudgetDepartement> budgetDepartements) {
        this.budgetDepartements = budgetDepartements;
    }

    public List<Depense> getDepenses() {
        return depenses;
    }

    public void setDepenses(List<Depense> depenses) {
        this.depenses = depenses;
    }
} 