package com.example.demo.service.impl;

import com.example.demo.dto.BudgetDTO;
import com.example.demo.entity.Budget;
import com.example.demo.repository.BudgetRepository;
import com.example.demo.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {
    @Autowired
    private BudgetRepository budgetRepository;

    private BudgetDTO toDTO(Budget b) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(b.getId());
        dto.setAnnee(b.getAnnee());
        dto.setMontant(b.getMontant());
        return dto;
    }

    private Budget toEntity(BudgetDTO dto) {
        Budget b = new Budget();
        b.setId(dto.getId());
        b.setAnnee(dto.getAnnee());
        b.setMontant(dto.getMontant());
        return b;
    }

    @Override
    public List<BudgetDTO> findAll() {
        return budgetRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public BudgetDTO findById(Integer id) {
        return budgetRepository.findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public BudgetDTO save(BudgetDTO budgetDTO) {
        Budget b = toEntity(budgetDTO);
        return toDTO(budgetRepository.save(b));
    }

    @Override
    public BudgetDTO update(Integer id, BudgetDTO budgetDTO) {
        Budget b = toEntity(budgetDTO);
        b.setId(id);
        return toDTO(budgetRepository.save(b));
    }

    @Override
    public void delete(Integer id) {
        budgetRepository.deleteById(id);
    }
} 