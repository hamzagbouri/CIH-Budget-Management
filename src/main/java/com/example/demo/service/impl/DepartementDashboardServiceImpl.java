package com.example.demo.service.impl;

import com.example.demo.dto.BudgetDTO;
import com.example.demo.dto.DepartementDashboardDTO;
import com.example.demo.dto.DepenseDTO;
import com.example.demo.entity.Budget;
import com.example.demo.entity.BudgetDepartement;
import com.example.demo.entity.Departement;
import com.example.demo.entity.Depense;
import com.example.demo.entity.Utilisateur;
import com.example.demo.repository.BudgetDepartementRepository;
import com.example.demo.repository.DepenseRepository;
import com.example.demo.repository.UtilisateurRepository;
import com.example.demo.service.DepartementDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DepartementDashboardServiceImpl implements DepartementDashboardService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private BudgetDepartementRepository budgetDepartementRepository;

    @Autowired
    private DepenseRepository depenseRepository;

    @Override
    public DepartementDashboardDTO getDepartementDashboard(Integer userId) {
        DepartementDashboardDTO dashboard = new DepartementDashboardDTO();

        // Get user and their department
        Optional<Utilisateur> userOpt = utilisateurRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Utilisateur non trouvé");
        }

        Utilisateur user = userOpt.get();
        Departement departement = user.getDepartement();

        if (departement == null) {
            throw new RuntimeException("L'utilisateur n'est pas assigné à un département");
        }

        // Set department info
        dashboard.setDepartementId(departement.getId());
        dashboard.setDepartementNom(departement.getNom());

        // Get current year budget for the department
        int currentYear = LocalDate.now().getYear();
        Optional<BudgetDepartement> budgetDeptOpt = budgetDepartementRepository
                .findByDepartementIdAndAnnee(departement.getId(), currentYear);

        if (budgetDeptOpt.isPresent()) {
            BudgetDepartement budgetDept = budgetDeptOpt.get();
            BudgetDTO budgetDTO = new BudgetDTO();
            budgetDTO.setId(budgetDept.getId());
            budgetDTO.setAnnee(budgetDept.getAnnee());
            budgetDTO.setMontant(budgetDept.getMontant());
            dashboard.setBudget(budgetDTO);
        }

        // Get recent expenses (last 10 expenses)
        List<Depense> recentDepenses = depenseRepository
                .findByDepartementOrderByDateDesc(departement)
                .stream()
                .limit(10)
                .collect(Collectors.toList());

        // Convert to DTOs
        List<DepenseDTO> depenseDTOs = recentDepenses.stream()
                .map(this::convertToDepenseDTO)
                .collect(Collectors.toList());

        dashboard.setRecentDepenses(depenseDTOs);

        // Calculate total expenses for current year
        double totalDepenses = depenseRepository
                .findByDepartementAndDateBetween(
                        departement,
                        LocalDate.of(currentYear, 1, 1),
                        LocalDate.of(currentYear, 12, 31)
                )
                .stream()
                .mapToDouble(Depense::getMontant)
                .sum();

        dashboard.setTotalDepenses((float) totalDepenses);

        // Calculate remaining budget
        if (dashboard.getBudget() != null) {
            Float budgetRestant = dashboard.getBudget().getMontant() - (float) totalDepenses;
            dashboard.setBudgetRestant(budgetRestant);
        } else {
            dashboard.setBudgetRestant(0.0f);
        }

        return dashboard;
    }

    private DepenseDTO convertToDepenseDTO(Depense depense) {
        DepenseDTO dto = new DepenseDTO();
        dto.setId(depense.getId());
        dto.setTitre(depense.getTitre());
        dto.setDescription(depense.getDescription());
        dto.setType(depense.getType());
        dto.setDate(depense.getDate());
        dto.setMontant(depense.getMontant());
        dto.setDepartementId(depense.getDepartement().getId());
        return dto;
    }
} 