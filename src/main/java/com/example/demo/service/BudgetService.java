package com.example.demo.service;

import com.example.demo.dto.BudgetDTO;
import com.example.demo.dto.BudgetUpdateDTO;
import java.util.List;

public interface BudgetService {
    List<BudgetDTO> findAll();
    BudgetDTO findById(Integer id);
    BudgetDTO save(BudgetDTO budgetDTO);
    BudgetDTO update(Integer id, BudgetDTO budgetDTO);
    BudgetDTO update(Integer id, BudgetUpdateDTO budgetUpdateDTO);
    void delete(Integer id);
    BudgetDTO findByAnnee(Integer annee);
    Object getBudgetSummary(Integer annee);
} 