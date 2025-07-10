package com.example.demo.service.impl;

import com.example.demo.dto.BudgetDepartementDTO;
import com.example.demo.entity.BudgetDepartement;
import com.example.demo.repository.BudgetDepartementRepository;
import com.example.demo.service.BudgetDepartementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetDepartementServiceImpl implements BudgetDepartementService {
    @Autowired
    private BudgetDepartementRepository budgetDepartementRepository;

    private BudgetDepartementDTO toDTO(BudgetDepartement bd) {
        BudgetDepartementDTO dto = new BudgetDepartementDTO();
        dto.setId(bd.getId());
        if (bd.getDepartement() != null) dto.setDepartementId(bd.getDepartement().getId());
        if (bd.getBudget() != null) dto.setBudgetId(bd.getBudget().getId());
        return dto;
    }

    private BudgetDepartement toEntity(BudgetDepartementDTO dto) {
        BudgetDepartement bd = new BudgetDepartement();
        bd.setId(dto.getId());
        // Pour les relations, il faut injecter les repositories Budget et Departement si besoin
        return bd;
    }

    @Override
    public List<BudgetDepartementDTO> findAll() {
        return budgetDepartementRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public BudgetDepartementDTO findById(Integer id) {
        return budgetDepartementRepository.findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public BudgetDepartementDTO save(BudgetDepartementDTO budgetDepartementDTO) {
        BudgetDepartement bd = toEntity(budgetDepartementDTO);
        return toDTO(budgetDepartementRepository.save(bd));
    }

    @Override
    public BudgetDepartementDTO update(Integer id, BudgetDepartementDTO budgetDepartementDTO) {
        BudgetDepartement bd = toEntity(budgetDepartementDTO);
        bd.setId(id);
        return toDTO(budgetDepartementRepository.save(bd));
    }

    @Override
    public void delete(Integer id) {
        budgetDepartementRepository.deleteById(id);
    }
} 