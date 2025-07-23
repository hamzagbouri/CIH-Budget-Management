package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "responsable_departement", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"utilisateur_id", "annee"}, name = "uk_responsable_annee"),
    @UniqueConstraint(columnNames = {"departement_id", "annee"}, name = "uk_departement_annee")
})
public class ResponsableDepartement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @NotNull(message = "L'année est obligatoire")
    @Min(value = 2020, message = "L'année doit être au moins 2020")
    @Max(value = 2030, message = "L'année ne peut pas dépasser 2030")
    @Column(name = "annee", nullable = false)
    private Integer annee;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @NotNull(message = "L'utilisateur est obligatoire")
    private Utilisateur utilisateur;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departement_id", nullable = false)
    @NotNull(message = "Le département est obligatoire")
    private Departement departement;
    
    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;
    
    @Column(name = "actif", nullable = false)
    private Boolean actif = true;
    
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }

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

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public Departement getDepartement() {
        return departement;
    }

    public void setDepartement(Departement departement) {
        this.departement = departement;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Boolean getActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }
} 