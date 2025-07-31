package com.example.demo.service.impl;

import com.example.demo.dto.BudgetDepartementDTO;
import com.example.demo.entity.Budget;
import com.example.demo.entity.BudgetDepartement;
import com.example.demo.entity.Departement;
import com.example.demo.entity.Depense;
import com.example.demo.repository.BudgetDepartementRepository;
import com.example.demo.repository.BudgetRepository;
import com.example.demo.repository.DepartementRepository;
import com.example.demo.repository.DepenseRepository;
import com.example.demo.service.BudgetDepartementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetDepartementServiceImpl implements BudgetDepartementService {
    @Autowired
    private BudgetDepartementRepository budgetDepartementRepository;
    
    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private DepartementRepository departementRepository;

    @Autowired
    private DepenseRepository depenseRepository;

    private BudgetDepartementDTO toDTO(BudgetDepartement bd) {
        BudgetDepartementDTO dto = new BudgetDepartementDTO();
        dto.setId(bd.getId());
        dto.setAnnee(bd.getAnnee());
        dto.setMontant(bd.getMontant());
        if (bd.getDepartement() != null) dto.setDepartementId(bd.getDepartement().getId());
        return dto;
    }

    private BudgetDepartement toEntity(BudgetDepartementDTO dto) {
        BudgetDepartement bd = new BudgetDepartement();
        bd.setId(dto.getId());
        bd.setAnnee(dto.getAnnee());
        bd.setMontant(dto.getMontant());
        
        // Set department
        if (dto.getDepartementId() != null) {
            Optional<Departement> departementOpt = departementRepository.findById(dto.getDepartementId());
            if (departementOpt.isPresent()) {
                bd.setDepartement(departementOpt.get());
            }
        }
        
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
        // Validate budget constraints
        if (!validateBudgetConstraints(budgetDepartementDTO)) {
            throw new RuntimeException("Le budget du département dépasse le budget total annuel disponible");
        }
        
        BudgetDepartement bd = toEntity(budgetDepartementDTO);
        return toDTO(budgetDepartementRepository.save(bd));
    }
    
    private boolean validateBudgetConstraints(BudgetDepartementDTO dto) {
        if (dto.getAnnee() == null || dto.getMontant() == null) {
            return false;
        }
        
        // Get the annual budget for this year
        Optional<Budget> budgetOpt = budgetRepository.findByAnnee(dto.getAnnee());
        if (budgetOpt.isEmpty()) {
            return false;
        }
        
        Budget annualBudget = budgetOpt.get();
        
        // Calculate total allocated budget for this year (excluding current record if updating)
        Float totalAllocated = (float) budgetDepartementRepository
                .findByAnnee(dto.getAnnee())
                .stream()
                .filter(bd -> !bd.getId().equals(dto.getId())) // Exclude current record if updating
                .mapToDouble(BudgetDepartement::getMontant)
                .sum();
        
        // Add the new budget amount
        totalAllocated += dto.getMontant();
        
        // Check if it exceeds the annual budget
        return totalAllocated <= annualBudget.getMontant();
    }

    @Override
    public BudgetDepartementDTO update(Integer id, BudgetDepartementDTO budgetDepartementDTO) {
        budgetDepartementDTO.setId(id);
        
        // Validate budget constraints
        if (!validateBudgetConstraints(budgetDepartementDTO)) {
            throw new RuntimeException("Le budget du département dépasse le budget total annuel disponible");
        }
        
        BudgetDepartement bd = toEntity(budgetDepartementDTO);
        return toDTO(budgetDepartementRepository.save(bd));
    }

    @Override
    public void delete(Integer id) {
        budgetDepartementRepository.deleteById(id);
    }
    
    @Override
    public List<BudgetDepartementDTO> findByAnnee(Integer annee) {
        return budgetDepartementRepository.findByAnnee(annee)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<BudgetDepartementDTO> findByDepartement(Integer departementId) {
        return budgetDepartementRepository.findByDepartementId(departementId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public BudgetDepartementDTO findByDepartementAndYear(Integer departementId, Integer annee) {
        return budgetDepartementRepository.findByDepartementIdAndAnnee(departementId, annee)
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    public List<BudgetDepartementDTO> getAllBudgetsSummary(Integer annee) {
        List<BudgetDepartement> budgets;
        if (annee != null) {
            budgets = budgetDepartementRepository.findByAnnee(annee);
        } else {
            budgets = budgetDepartementRepository.findAll();
        }
        return budgets.stream().map(bd -> {
            BudgetDepartementDTO dto = toDTO(bd);
            Float total = bd.getMontant();
            final int budgetYear = bd.getAnnee();
            Float used = depenseRepository.findByDepartementAndStatus(bd.getDepartement(), "VALID")
                .stream()
                .filter(d -> annee == null || (d.getDate() != null && d.getDate().getYear() == budgetYear))
                .map(Depense -> Depense.getMontant() == null ? 0f : Depense.getMontant())
                .reduce(0f, Float::sum);
            dto.setTotalBudget(total);
            dto.setUsedBudget(used);
            dto.setRemainingBudget(total - used);
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public BudgetDepartementDTO getDepartementBudgetSummary(Integer departementId, Integer annee) {
        BudgetDepartement bd = null;
        if (annee != null) {
            bd = budgetDepartementRepository.findByDepartementIdAndAnnee(departementId, annee).orElse(null);
        } else {
            List<BudgetDepartement> list = budgetDepartementRepository.findByDepartementId(departementId);
            if (!list.isEmpty()) bd = list.get(0);
        }
        if (bd == null) return null;
        BudgetDepartementDTO dto = toDTO(bd);
        Float total = bd.getMontant();
        final int budgetYear = bd.getAnnee();
        Float used = depenseRepository.findByDepartementAndStatus(bd.getDepartement(), "VALID")
            .stream()
            .filter(d -> annee == null || (d.getDate() != null && d.getDate().getYear() == budgetYear))
            .map(Depense -> Depense.getMontant() == null ? 0f : Depense.getMontant())
            .reduce(0f, Float::sum);
        dto.setTotalBudget(total);
        dto.setUsedBudget(used);
        dto.setRemainingBudget(total - used);
        return dto;
    }
} 