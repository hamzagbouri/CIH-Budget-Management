package com.example.demo.dto;

import lombok.Data;

@Data
public class BudgetDepartementDTO {
    private Integer id;
    private Integer annee;
    private Float montant;
    private Integer departementId;
    private Float totalBudget;
    private Float usedBudget;
    private Float remainingBudget;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getAnnee() { return annee; }
    public void setAnnee(Integer annee) { this.annee = annee; }
    public Float getMontant() { return montant; }
    public void setMontant(Float montant) { this.montant = montant; }
    public Integer getDepartementId() { return departementId; }
    public void setDepartementId(Integer departementId) { this.departementId = departementId; }
    public Float getTotalBudget() { return totalBudget; }
    public void setTotalBudget(Float totalBudget) { this.totalBudget = totalBudget; }
    public Float getUsedBudget() { return usedBudget; }
    public void setUsedBudget(Float usedBudget) { this.usedBudget = usedBudget; }
    public Float getRemainingBudget() { return remainingBudget; }
    public void setRemainingBudget(Float remainingBudget) { this.remainingBudget = remainingBudget; }
} 