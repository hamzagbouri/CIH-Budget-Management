package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserDashboardDTO {
    private Integer departementId;
    private String departementNom;
    private Integer annee;
    private Float budgetTotal;
    private Float budgetUtilise;
    private Float budgetRestant;
    private Integer totalDepenses;
    private Integer depensesValidees;
    private Integer depensesEnAttente;
    private Integer depensesRefusees;
    private Float totalMontantValidees;
    private Float totalMontantRefusees;
    private Float pourcentageUtilisation;
    private List<DepenseDTO> recentDepenses;
    private List<String> prestataires;
} 