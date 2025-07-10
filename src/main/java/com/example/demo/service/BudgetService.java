package com.example.demo.service;

import com.example.demo.dto.BudgetDTO;
import java.util.List;

public interface BudgetService {
    List<BudgetDTO> findAll();
    BudgetDTO findById(Integer id);
    BudgetDTO save(BudgetDTO budgetDTO);
    BudgetDTO update(Integer id, BudgetDTO budgetDTO);
    void delete(Integer id);
} 