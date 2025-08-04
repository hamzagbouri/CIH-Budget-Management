package com.example.demo.service.impl;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.service.AdminService;
import com.example.demo.service.DepenseService;
import com.example.demo.service.ResponsableDepartementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private BudgetDepartementRepository budgetDepartementRepository;
    
    @Autowired
    private DepartementRepository departementRepository;
    
    @Autowired
    private DepenseRepository depenseRepository;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private ResponsableDepartementRepository responsableDepartementRepository;
    
    @Autowired
    private DepenseService depenseService;
    
    @Autowired
    private ResponsableDepartementService responsableDepartementService;

    // ==================== DASHBOARD ANALYTICS ====================
    
    @Override
    public AdminDashboardDTO getAdminDashboard(Integer annee) {
        if (annee == null) {
            annee = LocalDate.now().getYear();
        }
        
        final Integer finalAnnee = annee;
        
        AdminDashboardDTO dashboard = new AdminDashboardDTO();
        dashboard.setAnnee(finalAnnee);
        
        // Get total budget for the year
        Budget budget = budgetRepository.findByAnnee(finalAnnee).orElse(null);
        Float totalBudget = budget != null ? budget.getMontant() : 0f;
        dashboard.setTotalBudget(totalBudget);
        
        // Get total department budgets
        List<BudgetDepartement> budgetDepartements = budgetDepartementRepository.findByAnnee(finalAnnee);
        Float totalBudgetUtilise = (float) budgetDepartements.stream()
                .mapToDouble(BudgetDepartement::getMontant)
                .sum();
        dashboard.setTotalBudgetUtilise(totalBudgetUtilise);
        dashboard.setTotalBudgetRestant(totalBudget - totalBudgetUtilise);
        
        // Get department count
        long totalDepartements = departementRepository.count();
        dashboard.setTotalDepartements((int) totalDepartements);
        
        // Get expense statistics
        List<Depense> allDepenses = depenseRepository.findByAnnee(finalAnnee);
        dashboard.setTotalDepenses(allDepenses.size());
        
        long depensesEnAttente = allDepenses.stream()
                .filter(d -> "EN_ATTENTE".equals(d.getStatus()))
                .count();
        dashboard.setDepensesEnAttente((int) depensesEnAttente);
        
        long depensesValidees = allDepenses.stream()
                .filter(d -> "VALID".equals(d.getStatus()))
                .count();
        dashboard.setDepensesValidees((int) depensesValidees);
        
        long depensesRefusees = allDepenses.stream()
                .filter(d -> "INVALID".equals(d.getStatus()))
                .count();
        dashboard.setDepensesRefusees((int) depensesRefusees);
        
        // Get department analytics
        List<DepartementAnalyticsDTO> analytics = getDepartementsAnalytics(finalAnnee);
        dashboard.setDepartementsAnalytics(analytics);
        
        // Get budgets by year
        List<Budget> budgets = budgetRepository.findAll();
        List<BudgetDTO> budgetDTOs = budgets.stream()
                .map(this::convertToBudgetDTO)
                .collect(Collectors.toList());
        dashboard.setBudgetsParAnnee(budgetDTOs);
        
        return dashboard;
    }

    // ==================== BUDGET MANAGEMENT ====================
    
    @Override
    public BudgetDTO addBudget(BudgetDTO budgetDTO) {
        // Check if budget already exists for this year
        Budget existingBudget = budgetRepository.findByAnnee(budgetDTO.getAnnee()).orElse(null);
        if (existingBudget != null) {
            throw new RuntimeException("Un budget existe déjà pour l'année " + budgetDTO.getAnnee());
        }
        
        Budget budget = new Budget();
        budget.setAnnee(budgetDTO.getAnnee());
        budget.setMontant(budgetDTO.getMontant());
        budget.setDescription(budgetDTO.getDescription());
        
        Budget savedBudget = budgetRepository.save(budget);
        return convertToBudgetDTO(savedBudget);
    }
    
    @Override
    public BudgetDTO updateBudget(Integer id, BudgetUpdateDTO budgetUpdateDTO) {
        if (budgetUpdateDTO.getDescription() == null || budgetUpdateDTO.getDescription().trim().isEmpty()) {
            throw new RuntimeException("La raison de modification est obligatoire");
        }
        
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget non trouvé"));
        
        budget.setMontant(budgetUpdateDTO.getMontant());
        budget.setDescription(budgetUpdateDTO.getDescription());
        
        Budget savedBudget = budgetRepository.save(budget);
        return convertToBudgetDTO(savedBudget);
    }
    
    @Override
    public BudgetDTO getBudgetByYear(Integer annee) {
        Budget budget = budgetRepository.findByAnnee(annee).orElse(null);
        if (budget == null) {
            throw new RuntimeException("Aucun budget trouvé pour l'année " + annee);
        }
        return convertToBudgetDTO(budget);
    }

    // ==================== EXPENSE VALIDATION ====================
    
    @Override
    public DepenseDTO validateExpense(Integer id) {
        return depenseService.validateDepense(id);
    }
    
    @Override
    public DepenseDTO rejectExpense(Integer id) {
        return depenseService.invalidateDepense(id);
    }

    // ==================== DEPARTMENT ANALYTICS ====================
    
    @Override
    public List<DepartementAnalyticsDTO> getDepartementsAnalytics(Integer annee) {
        if (annee == null) {
            annee = LocalDate.now().getYear();
        }
        
        final Integer finalAnnee = annee;
        List<Departement> departements = departementRepository.findAll();
        
        return departements.stream()
                .map(departement -> getDepartementAnalytics(departement.getId(), finalAnnee))
                .collect(Collectors.toList());
    }
    
    @Override
    public DepartementAnalyticsDTO getDepartementAnalytics(Integer departementId, Integer annee) {
        if (annee == null) {
            annee = LocalDate.now().getYear();
        }
        
        final Integer finalAnnee = annee;
        
        Departement departement = departementRepository.findById(departementId)
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));
        
        DepartementAnalyticsDTO analytics = new DepartementAnalyticsDTO();
        analytics.setDepartementId(departementId);
        analytics.setDepartementNom(departement.getNom());
        
        // Get responsible
        ResponsableDepartement responsable = responsableDepartementRepository
                .findByDepartementIdAndAnneeAndActifTrue(departementId, finalAnnee);
        if (responsable != null) {
            Utilisateur utilisateur = responsable.getUtilisateur();
            analytics.setResponsableNom(utilisateur.getNom());
            analytics.setResponsableEmail(utilisateur.getEmail());
        } else {
            analytics.setResponsableNom("Aucun responsable");
            analytics.setResponsableEmail("");
        }
        
        // Get budget
        BudgetDepartement budgetDepartement = budgetDepartementRepository
                .findByDepartementIdAndAnnee(departementId, finalAnnee).orElse(null);
        if (budgetDepartement != null) {
            analytics.setBudgetTotal(budgetDepartement.getMontant());
        } else {
            analytics.setBudgetTotal(0f);
        }
        
        // Get expenses
        List<Depense> depenses = depenseRepository.findByDepartementIdAndAnnee(departementId, finalAnnee);
        analytics.setTotalDepenses(depenses.size());
        
        long depensesValidees = depenses.stream()
                .filter(d -> "VALID".equals(d.getStatus()))
                .count();
        analytics.setDepensesValidees((int) depensesValidees);
        
        long depensesEnAttente = depenses.stream()
                .filter(d -> "EN_ATTENTE".equals(d.getStatus()))
                .count();
        analytics.setDepensesEnAttente((int) depensesEnAttente);
        
        long depensesRefusees = depenses.stream()
                .filter(d -> "INVALID".equals(d.getStatus()))
                .count();
        analytics.setDepensesRefusees((int) depensesRefusees);
        
        // Calculate used budget (only validated expenses)
        Float budgetUtilise = (float) depenses.stream()
                .filter(d -> "VALID".equals(d.getStatus()))
                .mapToDouble(Depense::getMontant)
                .sum();
        analytics.setBudgetUtilise(budgetUtilise);
        
        // Calculate remaining budget
        Float budgetRestant = analytics.getBudgetTotal() - analytics.getBudgetUtilise();
        analytics.setBudgetRestant(budgetRestant);
        
        // Calculate usage percentage
        if (analytics.getBudgetTotal() > 0) {
            Float pourcentage = (analytics.getBudgetUtilise() / analytics.getBudgetTotal()) * 100;
            analytics.setPourcentageUtilisation(pourcentage);
        } else {
            analytics.setPourcentageUtilisation(0f);
        }
        
        return analytics;
    }

    // ==================== DEPARTMENT MANAGEMENT ====================
    
    @Override
    public List<DepartementWithResponsableDTO> getDepartementsWithResponsable(Integer annee) {
        if (annee == null) {
            annee = LocalDate.now().getYear();
        }
        
        final Integer finalAnnee = annee;
        List<Departement> departements = departementRepository.findAll();
        
        return departements.stream()
                .map(departement -> {
                    DepartementWithResponsableDTO dto = new DepartementWithResponsableDTO();
                    dto.setId(departement.getId());
                    dto.setNom(departement.getNom());
                    dto.setAnnee(finalAnnee);
                    
                    // Get responsible
                    ResponsableDepartement responsable = responsableDepartementRepository
                            .findByDepartementIdAndAnneeAndActifTrue(departement.getId(), finalAnnee);
                    if (responsable != null) {
                        Utilisateur utilisateur = responsable.getUtilisateur();
                        dto.setResponsableNom(utilisateur.getNom());
                        dto.setResponsableEmail(utilisateur.getEmail());
                        dto.setResponsableMatricule(utilisateur.getMatricule());
                    }
                    
                    // Get budget
                    BudgetDepartement budgetDepartement = budgetDepartementRepository
                            .findByDepartementIdAndAnnee(departement.getId(), finalAnnee).orElse(null);
                    if (budgetDepartement != null) {
                        dto.setBudgetTotal(budgetDepartement.getMontant());
                        
                        // Calculate remaining budget
                        List<Depense> depenses = depenseRepository.findByDepartementIdAndAnnee(departement.getId(), finalAnnee);
                        Float budgetUtilise = (float) depenses.stream()
                                .filter(d -> "VALID".equals(d.getStatus()))
                                .mapToDouble(Depense::getMontant)
                                .sum();
                        dto.setBudgetRestant(budgetDepartement.getMontant() - budgetUtilise);
                    } else {
                        dto.setBudgetTotal(0f);
                        dto.setBudgetRestant(0f);
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    public DepartementWithResponsableDTO addDepartementWithResponsable(CreateResponsableRequestDTO request) {
        // Create department
        Departement departement = new Departement();
        departement.setNom(request.getNom());
        Departement savedDepartement = departementRepository.save(departement);
        
        // Create responsible using existing service
        CreateResponsableResponseDTO response = responsableDepartementService.createResponsable(request);
        
        // Return department with responsible info
        DepartementWithResponsableDTO dto = new DepartementWithResponsableDTO();
        dto.setId(savedDepartement.getId());
        dto.setNom(savedDepartement.getNom());
        dto.setAnnee(request.getAnnee());
        dto.setResponsableNom(request.getNom());
        dto.setResponsableEmail(request.getEmail());
        dto.setResponsableMatricule(request.getMatricule());
        dto.setBudgetTotal(0f);
        dto.setBudgetRestant(0f);
        
        return dto;
    }

    // ==================== DEPARTMENT BUDGET MANAGEMENT ====================
    
    @Override
    public BudgetDepartementDTO addDepartementBudget(Integer departementId, BudgetDepartementDTO budgetDTO) {
        // Check if budget already exists for this department and year
        BudgetDepartement existingBudget = budgetDepartementRepository
                .findByDepartementIdAndAnnee(departementId, budgetDTO.getAnnee()).orElse(null);
        if (existingBudget != null) {
            throw new RuntimeException("Un budget existe déjà pour ce département pour l'année " + budgetDTO.getAnnee());
        }
        
        // Validate total budget constraint
        validateBudgetConstraint(budgetDTO.getAnnee(), budgetDTO.getMontant(), null);
        
        Departement departement = departementRepository.findById(departementId)
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));
        
        BudgetDepartement budgetDepartement = new BudgetDepartement();
        budgetDepartement.setAnnee(budgetDTO.getAnnee());
        budgetDepartement.setMontant(budgetDTO.getMontant());
        budgetDepartement.setDescription(budgetDTO.getDescription());
        budgetDepartement.setDepartement(departement);
        
        BudgetDepartement savedBudget = budgetDepartementRepository.save(budgetDepartement);
        return convertToBudgetDepartementDTO(savedBudget);
    }
    
    @Override
    public BudgetDepartementDTO updateDepartementBudget(Integer departementId, BudgetDepartementUpdateDTO budgetUpdateDTO) {
        if (budgetUpdateDTO.getDescription() == null || budgetUpdateDTO.getDescription().trim().isEmpty()) {
            throw new RuntimeException("La raison de modification est obligatoire");
        }
        
        BudgetDepartement budgetDepartement = budgetDepartementRepository
                .findByDepartementIdAndAnnee(departementId, budgetUpdateDTO.getAnnee())
                .orElseThrow(() -> new RuntimeException("Budget département non trouvé"));
        
        // Validate total budget constraint
        validateBudgetConstraint(budgetDepartement.getAnnee(), budgetUpdateDTO.getMontant(), departementId);
        
        budgetDepartement.setMontant(budgetUpdateDTO.getMontant());
        budgetDepartement.setDescription(budgetUpdateDTO.getDescription());
        
        BudgetDepartement savedBudget = budgetDepartementRepository.save(budgetDepartement);
        return convertToBudgetDepartementDTO(savedBudget);
    }

    // ==================== BUDGET VALIDATION ====================
    
    @Override
    public Object validateBudgets(Integer annee) {
        Budget mainBudget = budgetRepository.findByAnnee(annee).orElse(null);
        if (mainBudget == null) {
            return Map.of("valid", false, "message", "Aucun budget principal trouvé pour l'année " + annee);
        }
        
        List<BudgetDepartement> departmentBudgets = budgetDepartementRepository.findByAnnee(annee);
        Float totalDepartmentBudgets = (float) departmentBudgets.stream()
                .mapToDouble(BudgetDepartement::getMontant)
                .sum();
        
        boolean isValid = totalDepartmentBudgets <= mainBudget.getMontant();
        
        return Map.of(
            "valid", isValid,
            "mainBudget", mainBudget.getMontant(),
            "totalDepartmentBudgets", totalDepartmentBudgets,
            "difference", mainBudget.getMontant() - totalDepartmentBudgets,
            "message", isValid ? 
                "Les budgets département sont valides" : 
                "La somme des budgets département dépasse le budget principal"
        );
    }

    // ==================== HELPER METHODS ====================
    
    private void validateBudgetConstraint(Integer annee, Float newAmount, Integer excludeDepartementId) {
        Budget mainBudget = budgetRepository.findByAnnee(annee).orElse(null);
        if (mainBudget == null) {
            throw new RuntimeException("Aucun budget principal trouvé pour l'année " + annee);
        }
        
        List<BudgetDepartement> existingBudgets = budgetDepartementRepository.findByAnnee(annee);
        Float totalExistingBudgets = (float) existingBudgets.stream()
                .filter(bd -> excludeDepartementId == null || !bd.getDepartement().getId().equals(excludeDepartementId))
                .mapToDouble(BudgetDepartement::getMontant)
                .sum();
        
        if (totalExistingBudgets + newAmount > mainBudget.getMontant()) {
            throw new RuntimeException("La somme des budgets département ne peut pas dépasser le budget principal");
        }
    }
    
    private BudgetDTO convertToBudgetDTO(Budget budget) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(budget.getId());
        dto.setAnnee(budget.getAnnee());
        dto.setMontant(budget.getMontant());
        dto.setDescription(budget.getDescription());
        return dto;
    }
    
    private BudgetDepartementDTO convertToBudgetDepartementDTO(BudgetDepartement budgetDepartement) {
        BudgetDepartementDTO dto = new BudgetDepartementDTO();
        dto.setId(budgetDepartement.getId());
        dto.setAnnee(budgetDepartement.getAnnee());
        dto.setMontant(budgetDepartement.getMontant());
        dto.setDepartementId(budgetDepartement.getDepartement().getId());
        dto.setDescription(budgetDepartement.getDescription());
        return dto;
    }
} 