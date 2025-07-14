package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class DepartementDashboardDTO {
    private Integer departementId;
    private String departementNom;
    private BudgetDTO budget;
    private List<DepenseDTO> recentDepenses;
    private Float totalDepenses;
    private Float budgetRestant;
} 