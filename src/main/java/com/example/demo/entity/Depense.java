package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;

@Data
@Entity
public class Depense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String titre;
    private String description;
    private String type;
    private LocalDate date;
    private Float montant;

    @ManyToOne
    @JoinColumn(name = "departement_id")
    private Departement departement;

    @Column(nullable = false)
    private String status = "EN_ATTENTE";

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Float getMontant() { return montant; }
    public void setMontant(Float montant) { this.montant = montant; }
    public Departement getDepartement() { return departement; }
    public void setDepartement(Departement departement) { this.departement = departement; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
} 