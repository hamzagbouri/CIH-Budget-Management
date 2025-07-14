package com.example.demo.service.impl;

import com.example.demo.dto.DepenseDTO;
import com.example.demo.entity.BudgetDepartement;
import com.example.demo.entity.Departement;
import com.example.demo.entity.Depense;
import com.example.demo.repository.BudgetDepartementRepository;
import com.example.demo.repository.DepartementRepository;
import com.example.demo.repository.DepenseRepository;
import com.example.demo.service.DepenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DepenseServiceImpl implements DepenseService {
    @Autowired
    private DepenseRepository depenseRepository;
    
    @Autowired
    private DepartementRepository departementRepository;
    
    @Autowired
    private BudgetDepartementRepository budgetDepartementRepository;

    private DepenseDTO toDTO(Depense d) {
        DepenseDTO dto = new DepenseDTO();
        dto.setId(d.getId());
        dto.setTitre(d.getTitre());
        dto.setDescription(d.getDescription());
        dto.setType(d.getType());
        dto.setDate(d.getDate());
        dto.setMontant(d.getMontant());
        if (d.getDepartement() != null) dto.setDepartementId(d.getDepartement().getId());
        return dto;
    }

    private Depense toEntity(DepenseDTO dto) {
        Depense d = new Depense();
        d.setId(dto.getId());
        d.setTitre(dto.getTitre());
        d.setDescription(dto.getDescription());
        d.setType(dto.getType());
        d.setDate(dto.getDate());
        d.setMontant(dto.getMontant());
        
        // Set department if departementId is provided
        if (dto.getDepartementId() != null) {
            Optional<Departement> departementOpt = departementRepository.findById(dto.getDepartementId());
            if (departementOpt.isPresent()) {
                d.setDepartement(departementOpt.get());
            }
        }
        
        return d;
    }

    @Override
    public List<DepenseDTO> findAll() {
        return depenseRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public DepenseDTO findById(Integer id) {
        return depenseRepository.findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public DepenseDTO save(DepenseDTO depenseDTO) {
        // Validate budget constraints
        if (!validateBudgetConstraints(depenseDTO)) {
            throw new RuntimeException("Le montant total des dépenses dépasse le budget du département pour cette année");
        }
        
        Depense d = toEntity(depenseDTO);
        return toDTO(depenseRepository.save(d));
    }

    @Override
    public DepenseDTO update(Integer id, DepenseDTO depenseDTO) {
        depenseDTO.setId(id);
        
        // Validate budget constraints
        if (!validateBudgetConstraints(depenseDTO)) {
            throw new RuntimeException("Le montant total des dépenses dépasse le budget du département pour cette année");
        }
        
        Depense d = toEntity(depenseDTO);
        return toDTO(depenseRepository.save(d));
    }

    @Override
    public void delete(Integer id) {
        depenseRepository.deleteById(id);
    }
    
    @Override
    public Float getRemainingBudget(Integer departementId, Integer year) {
        // Get the department budget for this year
        Optional<BudgetDepartement> budgetDeptOpt = budgetDepartementRepository
                .findByDepartementIdAndAnnee(departementId, year);
        
        if (budgetDeptOpt.isEmpty()) {
            return 0.0f; // No budget defined
        }
        
        BudgetDepartement budgetDept = budgetDeptOpt.get();
        
        // Calculate total expenses for this department in this year
        Float totalExpenses = (float) depenseRepository
                .findByDepartementAndDateBetween(
                        budgetDept.getDepartement(),
                        LocalDate.of(year, 1, 1),
                        LocalDate.of(year, 12, 31)
                )
                .stream()
                .mapToDouble(Depense::getMontant)
                .sum();
        
        // Return remaining budget
        return budgetDept.getMontant() - totalExpenses;
    }
    
    private boolean validateBudgetConstraints(DepenseDTO dto) {
        if (dto.getDepartementId() == null || dto.getMontant() == null || dto.getDate() == null) {
            return false;
        }
        
        int year = dto.getDate().getYear();
        
        // Get the department budget for this year
        Optional<BudgetDepartement> budgetDeptOpt = budgetDepartementRepository
                .findByDepartementIdAndAnnee(dto.getDepartementId(), year);
        
        if (budgetDeptOpt.isEmpty()) {
            // No budget defined for this department and year, allow the expense
            return true;
        }
        
        BudgetDepartement budgetDept = budgetDeptOpt.get();
        
        // Calculate total expenses for this department in this year (excluding current record if updating)
        Float totalExpenses = (float) depenseRepository
                .findByDepartementAndDateBetween(
                        budgetDept.getDepartement(),
                        LocalDate.of(year, 1, 1),
                        LocalDate.of(year, 12, 31)
                )
                .stream()
                .filter(depense -> !depense.getId().equals(dto.getId())) // Exclude current record if updating
                .mapToDouble(Depense::getMontant)
                .sum();
        
        // Add the new expense amount
        totalExpenses += dto.getMontant();
        
        // Check if it exceeds the department budget
        return totalExpenses <= budgetDept.getMontant();
    }
} 