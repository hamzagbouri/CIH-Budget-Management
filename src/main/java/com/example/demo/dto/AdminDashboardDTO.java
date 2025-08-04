package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdminDashboardDTO {
    private Integer annee;
    private Float totalBudget;
    private Float totalBudgetUtilise;
    private Float totalBudgetRestant;
    private Integer totalDepartements;
    private Integer totalDepenses;
    private Integer depensesEnAttente;
    private Integer depensesValidees;
    private Integer depensesRefusees;
    private List<DepartementAnalyticsDTO> departementsAnalytics;
    private List<BudgetDTO> budgetsParAnnee;
} 