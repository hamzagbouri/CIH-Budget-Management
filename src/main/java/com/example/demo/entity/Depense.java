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
    private String prestataire; // New field for service provider

    @ManyToOne
    @JoinColumn(name = "departement_id")
    private Departement departement;

    @Column(nullable = false)
    private String status = "EN_ATTENTE";
} 