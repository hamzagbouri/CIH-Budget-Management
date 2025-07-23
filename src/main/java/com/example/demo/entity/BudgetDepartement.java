package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Entity
@Table(name = "budget_departement")
public class BudgetDepartement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @NotNull(message = "L'année est obligatoire")
    @Min(value = 2020, message = "L'année doit être au moins 2020")
    @Max(value = 2030, message = "L'année ne peut pas dépasser 2030")
    @Column(name = "annee", nullable = false)
    private Integer annee;
    
    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le montant doit être supérieur à 0")
    @Digits(integer = 10, fraction = 2, message = "Le montant doit avoir au maximum 10 chiffres avant la virgule et 2 après")
    @Column(name = "montant", nullable = false)
    private Float montant;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departement_id", nullable = false)
    @NotNull(message = "Le département est obligatoire")
    private Departement departement;

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getAnnee() {
        return annee;
    }

    public void setAnnee(Integer annee) {
        this.annee = annee;
    }

    public Float getMontant() {
        return montant;
    }

    public void setMontant(Float montant) {
        this.montant = montant;
    }

    public Departement getDepartement() {
        return departement;
    }

    public void setDepartement(Departement departement) {
        this.departement = departement;
    }
} 