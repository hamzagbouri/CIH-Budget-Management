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

    // getters & setters
} 