package com.example.demo.service;

import com.example.demo.dto.*;

import java.util.List;

public interface AdminService {
    
    // Dashboard Analytics
    AdminDashboardDTO getAdminDashboard(Integer annee);
    
    // Budget Management
    BudgetDTO addBudget(BudgetDTO budgetDTO);
    BudgetDTO updateBudget(Integer id, BudgetUpdateDTO budgetUpdateDTO);
    BudgetDTO getBudgetByYear(Integer annee);
    
    // Expense Validation
    DepenseDTO validateExpense(Integer id);
    DepenseDTO rejectExpense(Integer id);
    
    // Department Analytics
    List<DepartementAnalyticsDTO> getDepartementsAnalytics(Integer annee);
    DepartementAnalyticsDTO getDepartementAnalytics(Integer departementId, Integer annee);
    
    // Department Management
    List<DepartementWithResponsableDTO> getDepartementsWithResponsable(Integer annee);
    DepartementWithResponsableDTO addDepartementWithResponsable(CreateResponsableRequestDTO request);
    
    // Department Budget Management
    BudgetDepartementDTO addDepartementBudget(Integer departementId, BudgetDepartementDTO budgetDTO);
    BudgetDepartementDTO updateDepartementBudget(Integer departementId, BudgetDepartementUpdateDTO budgetUpdateDTO);
    
    // Budget Validation
    Object validateBudgets(Integer annee);
} 