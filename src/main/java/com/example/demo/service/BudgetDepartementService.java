package com.example.demo.service;

import com.example.demo.dto.BudgetDepartementDTO;
import java.util.List;

public interface BudgetDepartementService {
    List<BudgetDepartementDTO> findAll();
    BudgetDepartementDTO findById(Integer id);
    BudgetDepartementDTO save(BudgetDepartementDTO budgetDepartementDTO);
    BudgetDepartementDTO update(Integer id, BudgetDepartementDTO budgetDepartementDTO);
    void delete(Integer id);
    List<BudgetDepartementDTO> findByAnnee(Integer annee);
    List<BudgetDepartementDTO> findByDepartement(Integer departementId);
    BudgetDepartementDTO findByDepartementAndYear(Integer departementId, Integer annee);
    List<BudgetDepartementDTO> getAllBudgetsSummary(Integer annee);
    BudgetDepartementDTO getDepartementBudgetSummary(Integer departementId, Integer annee);
} 