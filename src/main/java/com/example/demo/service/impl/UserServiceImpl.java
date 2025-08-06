package com.example.demo.service.impl;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.service.UserService;
import com.example.demo.service.EmailService;
import com.example.demo.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private DepartementRepository departementRepository;
    
    @Autowired
    private BudgetDepartementRepository budgetDepartementRepository;
    
    @Autowired
    private DepenseRepository depenseRepository;
    
    @Autowired
    private ResponsableDepartementRepository responsableDepartementRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private JwtUtil jwtUtil;

    // ==================== DASHBOARD ====================
    
    @Override
    public UserDashboardDTO getUserDashboard(Integer annee) {
        if (annee == null) {
            annee = LocalDate.now().getYear();
        }
        
        final Integer finalAnnee = annee;
        
        // Get current user
        Utilisateur user = getCurrentUser();
        Departement departement = user.getDepartement();
        
        if (departement == null) {
            throw new RuntimeException("Aucun département associé à cet utilisateur");
        }
        
        UserDashboardDTO dashboard = new UserDashboardDTO();
        dashboard.setDepartementId(departement.getId());
        dashboard.setDepartementNom(departement.getNom());
        dashboard.setAnnee(finalAnnee);
        
        // Get budget
        BudgetDepartement budgetDepartement = budgetDepartementRepository
                .findByDepartementIdAndAnnee(departement.getId(), finalAnnee).orElse(null);
        
        if (budgetDepartement != null) {
            dashboard.setBudgetTotal(budgetDepartement.getMontant());
        } else {
            dashboard.setBudgetTotal(0f);
        }
        
        // Get expenses for the year
        List<Depense> depenses = depenseRepository.findByDepartementIdAndAnnee(departement.getId(), finalAnnee);
        dashboard.setTotalDepenses(depenses.size());
        
        // Calculate statistics
        long depensesValidees = depenses.stream()
                .filter(d -> "VALID".equals(d.getStatus()))
                .count();
        dashboard.setDepensesValidees((int) depensesValidees);
        
        long depensesEnAttente = depenses.stream()
                .filter(d -> "EN_ATTENTE".equals(d.getStatus()))
                .count();
        dashboard.setDepensesEnAttente((int) depensesEnAttente);
        
        long depensesRefusees = depenses.stream()
                .filter(d -> "INVALID".equals(d.getStatus()))
                .count();
        dashboard.setDepensesRefusees((int) depensesRefusees);
        
        // Calculate amounts
        Float totalMontantValidees = (float) depenses.stream()
                .filter(d -> "VALID".equals(d.getStatus()))
                .mapToDouble(Depense::getMontant)
                .sum();
        dashboard.setTotalMontantValidees(totalMontantValidees);
        
        Float totalMontantRefusees = (float) depenses.stream()
                .filter(d -> "INVALID".equals(d.getStatus()))
                .mapToDouble(Depense::getMontant)
                .sum();
        dashboard.setTotalMontantRefusees(totalMontantRefusees);
        
        // Calculate used budget (only validated expenses)
        dashboard.setBudgetUtilise(totalMontantValidees);
        dashboard.setBudgetRestant(dashboard.getBudgetTotal() - totalMontantValidees);
        
        // Calculate usage percentage
        if (dashboard.getBudgetTotal() > 0) {
            Float pourcentage = (dashboard.getBudgetUtilise() / dashboard.getBudgetTotal()) * 100;
            dashboard.setPourcentageUtilisation(pourcentage);
        } else {
            dashboard.setPourcentageUtilisation(0f);
        }
        
        // Get recent expenses (last 10)
        List<Depense> recentDepenses = depenses.stream()
                .sorted((d1, d2) -> d2.getDate().compareTo(d1.getDate()))
                .limit(10)
                .collect(Collectors.toList());
        
        List<DepenseDTO> depenseDTOs = recentDepenses.stream()
                .map(this::convertToDepenseDTO)
                .collect(Collectors.toList());
        dashboard.setRecentDepenses(depenseDTOs);
        
        // Get unique prestataires
        List<String> prestataires = depenses.stream()
                .map(Depense::getPrestataire)
                .filter(p -> p != null && !p.trim().isEmpty())
                .distinct()
                .collect(Collectors.toList());
        dashboard.setPrestataires(prestataires);
        
        return dashboard;
    }

    // ==================== PROFILE MANAGEMENT ====================
    
    @Override
    public UserProfileDTO getUserProfile() {
        Utilisateur user = getCurrentUser();
        
        UserProfileDTO profile = new UserProfileDTO();
        profile.setId(user.getId());
        profile.setNom(user.getNom());
        profile.setEmail(user.getEmail());
        profile.setMatricule(user.getMatricule());
        profile.setRole(user.getRole());
        
        // Current department
        if (user.getDepartement() != null) {
            DepartementDTO departementDTO = new DepartementDTO();
            departementDTO.setId(user.getDepartement().getId());
            departementDTO.setNom(user.getDepartement().getNom());
            profile.setDepartementActuel(departementDTO);
        }
        
        // Historical departments and responsibilities
        List<ResponsableDepartement> responsabilites = responsableDepartementRepository
                .findByUtilisateurIdOrderByAnneeDesc(user.getId());
        
        List<DepartementDTO> departementsPrecedents = responsabilites.stream()
                .map(rd -> {
                    DepartementDTO dto = new DepartementDTO();
                    dto.setId(rd.getDepartement().getId());
                    dto.setNom(rd.getDepartement().getNom());
                    return dto;
                })
                .distinct()
                .collect(Collectors.toList());
        profile.setDepartementsPrecedents(departementsPrecedents);
        
        List<ResponsableDepartementDTO> historiqueResponsabilites = responsabilites.stream()
                .map(this::convertToResponsableDepartementDTO)
                .collect(Collectors.toList());
        profile.setHistoriqueResponsabilites(historiqueResponsabilites);
        
        return profile;
    }
    
    @Override
    public UserProfileDTO updateUserProfile(UserProfileDTO profileDTO) {
        Utilisateur user = getCurrentUser();
        
        // Update allowed fields
        if (profileDTO.getNom() != null && !profileDTO.getNom().trim().isEmpty()) {
            user.setNom(profileDTO.getNom());
        }
        
        if (profileDTO.getEmail() != null && !profileDTO.getEmail().trim().isEmpty()) {
            // Check if email is already taken by another user
            Utilisateur existingUser = utilisateurRepository.findByEmail(profileDTO.getEmail()).orElse(null);
            if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                throw new RuntimeException("Cet email est déjà utilisé par un autre utilisateur");
            }
            user.setEmail(profileDTO.getEmail());
        }
        
        if (profileDTO.getMatricule() != null && !profileDTO.getMatricule().trim().isEmpty()) {
            user.setMatricule(profileDTO.getMatricule());
        }
        
        Utilisateur savedUser = utilisateurRepository.save(user);
        
        // Return updated profile
        return getUserProfile();
    }
    
    @Override
    public void updatePassword(PasswordUpdateRequestDTO request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Les mots de passe ne correspondent pas");
        }
        
        Utilisateur user = getCurrentUser();
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Le mot de passe actuel est incorrect");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        utilisateurRepository.save(user);
    }

    // ==================== PASSWORD MANAGEMENT ====================
    
    @Override
    public void forgotPassword(ForgotPasswordRequestDTO request) {
        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Aucun utilisateur trouvé avec cet email"));
        
        // Generate reset token
        String resetToken = jwtUtil.generatePasswordResetToken(user.getEmail());
        
        // Send email with reset link
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        String emailContent = "Bonjour " + user.getNom() + ",\n\n" +
                "Vous avez demandé la réinitialisation de votre mot de passe.\n" +
                "Cliquez sur le lien suivant pour réinitialiser votre mot de passe :\n\n" +
                resetLink + "\n\n" +
                "Ce lien expire dans 1 heure.\n\n" +
                "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\n" +
                "Cordialement,\nL'équipe CIH";
        
        emailService.sendEmail(user.getEmail(), "Réinitialisation de mot de passe", emailContent);
    }
    
    @Override
    public void resetPassword(ResetPasswordRequestDTO request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Les mots de passe ne correspondent pas");
        }
        
        // Validate token and get email
        String email = jwtUtil.validatePasswordResetToken(request.getToken());
        if (email == null) {
            throw new RuntimeException("Token invalide ou expiré");
        }
        
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        utilisateurRepository.save(user);
    }

    // ==================== EXPENSE MANAGEMENT ====================
    
    @Override
    public List<DepenseDTO> getUserDepartmentExpenses(Integer annee, String status, String prestataire) {
        if (annee == null) {
            annee = LocalDate.now().getYear();
        }
        
        final Integer finalAnnee = annee;
        Utilisateur user = getCurrentUser();
        Departement departement = user.getDepartement();
        
        if (departement == null) {
            throw new RuntimeException("Aucun département associé à cet utilisateur");
        }
        
        List<Depense> depenses = depenseRepository.findByDepartementIdAndAnnee(departement.getId(), finalAnnee);
        
        // Apply filters
        if (status != null && !status.trim().isEmpty()) {
            depenses = depenses.stream()
                    .filter(d -> status.equals(d.getStatus()))
                    .collect(Collectors.toList());
        }
        
        if (prestataire != null && !prestataire.trim().isEmpty()) {
            depenses = depenses.stream()
                    .filter(d -> prestataire.equals(d.getPrestataire()))
                    .collect(Collectors.toList());
        }
        
        return depenses.stream()
                .map(this::convertToDepenseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public DepenseDTO getUserDepartmentExpense(Integer id) {
        Utilisateur user = getCurrentUser();
        Departement departement = user.getDepartement();
        
        if (departement == null) {
            throw new RuntimeException("Aucun département associé à cet utilisateur");
        }
        
        Depense depense = depenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dépense non trouvée"));
        
        // Verify the expense belongs to user's department
        if (!depense.getDepartement().getId().equals(departement.getId())) {
            throw new RuntimeException("Accès non autorisé à cette dépense");
        }
        
        return convertToDepenseDTO(depense);
    }
    
    @Override
    public DepenseDTO createUserDepartmentExpense(DepenseDTO depenseDTO) {
        Utilisateur user = getCurrentUser();
        Departement departement = user.getDepartement();
        
        if (departement == null) {
            throw new RuntimeException("Aucun département associé à cet utilisateur");
        }
        
        Depense depense = new Depense();
        depense.setTitre(depenseDTO.getTitre());
        depense.setDescription(depenseDTO.getDescription());
        depense.setType(depenseDTO.getType());
        depense.setDate(depenseDTO.getDate());
        depense.setMontant(depenseDTO.getMontant());
        depense.setPrestataire(depenseDTO.getPrestataire());
        depense.setDepartement(departement);
        depense.setStatus("EN_ATTENTE"); // Always start as pending
        
        Depense savedDepense = depenseRepository.save(depense);
        return convertToDepenseDTO(savedDepense);
    }
    
    @Override
    public DepenseDTO updateUserDepartmentExpense(Integer id, DepenseDTO depenseDTO) {
        Utilisateur user = getCurrentUser();
        Departement departement = user.getDepartement();
        
        if (departement == null) {
            throw new RuntimeException("Aucun département associé à cet utilisateur");
        }
        
        Depense depense = depenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dépense non trouvée"));
        
        // Verify the expense belongs to user's department
        if (!depense.getDepartement().getId().equals(departement.getId())) {
            throw new RuntimeException("Accès non autorisé à cette dépense");
        }
        
        // Update fields
        depense.setTitre(depenseDTO.getTitre());
        depense.setDescription(depenseDTO.getDescription());
        depense.setType(depenseDTO.getType());
        depense.setDate(depenseDTO.getDate());
        depense.setMontant(depenseDTO.getMontant());
        depense.setPrestataire(depenseDTO.getPrestataire());
        depense.setStatus("EN_ATTENTE"); // Reset to pending when modified
        
        Depense savedDepense = depenseRepository.save(depense);
        return convertToDepenseDTO(savedDepense);
    }
    
    @Override
    public void deleteUserDepartmentExpense(Integer id) {
        Utilisateur user = getCurrentUser();
        Departement departement = user.getDepartement();
        
        if (departement == null) {
            throw new RuntimeException("Aucun département associé à cet utilisateur");
        }
        
        Depense depense = depenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dépense non trouvée"));
        
        // Verify the expense belongs to user's department
        if (!depense.getDepartement().getId().equals(departement.getId())) {
            throw new RuntimeException("Accès non autorisé à cette dépense");
        }
        
        depenseRepository.delete(depense);
    }

    // ==================== ANALYTICS ====================
    
    @Override
    public Object getUserDepartmentAnalytics(Integer annee) {
        if (annee == null) {
            annee = LocalDate.now().getYear();
        }
        
        final Integer finalAnnee = annee;
        Utilisateur user = getCurrentUser();
        Departement departement = user.getDepartement();
        
        if (departement == null) {
            throw new RuntimeException("Aucun département associé à cet utilisateur");
        }
        
        // Get budget
        BudgetDepartement budgetDepartement = budgetDepartementRepository
                .findByDepartementIdAndAnnee(departement.getId(), finalAnnee).orElse(null);
        Float budgetTotal = budgetDepartement != null ? budgetDepartement.getMontant() : 0f;
        
        // Get expenses
        List<Depense> depenses = depenseRepository.findByDepartementIdAndAnnee(departement.getId(), finalAnnee);
        
        // Calculate statistics
        long totalDepenses = depenses.size();
        long depensesValidees = depenses.stream().filter(d -> "VALID".equals(d.getStatus())).count();
        long depensesEnAttente = depenses.stream().filter(d -> "EN_ATTENTE".equals(d.getStatus())).count();
        long depensesRefusees = depenses.stream().filter(d -> "INVALID".equals(d.getStatus())).count();
        
        Float totalMontantValidees = (float) depenses.stream()
                .filter(d -> "VALID".equals(d.getStatus()))
                .mapToDouble(Depense::getMontant)
                .sum();
        
        Float totalMontantRefusees = (float) depenses.stream()
                .filter(d -> "INVALID".equals(d.getStatus()))
                .mapToDouble(Depense::getMontant)
                .sum();
        
        Float budgetRestant = budgetTotal - totalMontantValidees;
        Float pourcentageUtilisation = budgetTotal > 0 ? (totalMontantValidees / budgetTotal) * 100 : 0f;
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("departementId", departement.getId());
        analytics.put("departementNom", departement.getNom());
        analytics.put("annee", finalAnnee);
        analytics.put("budgetTotal", budgetTotal);
        analytics.put("budgetUtilise", totalMontantValidees);
        analytics.put("budgetRestant", budgetRestant);
        analytics.put("totalDepenses", totalDepenses);
        analytics.put("depensesValidees", depensesValidees);
        analytics.put("depensesEnAttente", depensesEnAttente);
        analytics.put("depensesRefusees", depensesRefusees);
        analytics.put("totalMontantValidees", totalMontantValidees);
        analytics.put("totalMontantRefusees", totalMontantRefusees);
        analytics.put("pourcentageUtilisation", pourcentageUtilisation);
        
        return analytics;
    }
    
    @Override
    public List<String> getPrestataires() {
        Utilisateur user = getCurrentUser();
        Departement departement = user.getDepartement();
        
        if (departement == null) {
            throw new RuntimeException("Aucun département associé à cet utilisateur");
        }
        
        List<Depense> depenses = depenseRepository.findByDepartementId(departement.getId());
        
        return depenses.stream()
                .map(Depense::getPrestataire)
                .filter(p -> p != null && !p.trim().isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }

    // ==================== HELPER METHODS ====================
    
    private Utilisateur getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
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
        dto.setStatus(depense.getStatus());
        dto.setPrestataire(depense.getPrestataire());
        return dto;
    }
    
    private ResponsableDepartementDTO convertToResponsableDepartementDTO(ResponsableDepartement responsable) {
        ResponsableDepartementDTO dto = new ResponsableDepartementDTO();
        dto.setId(responsable.getId());
        dto.setAnnee(responsable.getAnnee());
        dto.setActif(responsable.getActif());
        
        if (responsable.getDepartement() != null) {
            dto.setDepartementId(responsable.getDepartement().getId());
            dto.setDepartementNom(responsable.getDepartement().getNom());
        }
        
        if (responsable.getUtilisateur() != null) {
            dto.setUtilisateurId(responsable.getUtilisateur().getId());
            dto.setUtilisateurNom(responsable.getUtilisateur().getNom());
            dto.setUtilisateurEmail(responsable.getUtilisateur().getEmail());
        }
        
        return dto;
    }
} 