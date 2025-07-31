package com.example.demo.dto;

import java.time.LocalDate;

public class DepenseDTO {
    private Integer id;
    private String titre;
    private String description;
    private String type;
    private LocalDate date;
    private Float montant;
    private Integer departementId;
    private String status;

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
    public Integer getDepartementId() { return departementId; }
    public void setDepartementId(Integer departementId) { this.departementId = departementId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
} 