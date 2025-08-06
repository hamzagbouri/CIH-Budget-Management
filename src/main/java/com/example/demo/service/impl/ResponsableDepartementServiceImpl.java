package com.example.demo.service.impl;

import com.example.demo.dto.ResponsableDepartementDTO;
import com.example.demo.dto.CreateResponsableRequestDTO;
import com.example.demo.dto.CreateResponsableResponseDTO;
import com.example.demo.entity.ResponsableDepartement;
import com.example.demo.entity.Utilisateur;
import com.example.demo.entity.Departement;
import com.example.demo.repository.ResponsableDepartementRepository;
import com.example.demo.repository.UtilisateurRepository;
import com.example.demo.repository.DepartementRepository;
import com.example.demo.service.ResponsableDepartementService;
import com.example.demo.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;
import java.security.SecureRandom;

@Service
public class ResponsableDepartementServiceImpl implements ResponsableDepartementService {
    
    private static final Logger logger = LoggerFactory.getLogger(ResponsableDepartementServiceImpl.class);
    
    @Autowired
    private ResponsableDepartementRepository responsableDepartementRepository;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private DepartementRepository departementRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private final SecureRandom secureRandom = new SecureRandom();
    
    private String generateSecurePassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        StringBuilder password = new StringBuilder();
        
        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        
        return password.toString();
    }
    
    private ResponsableDepartementDTO toDTO(ResponsableDepartement rd) {
        logger.info("=== DEBUG: toDTO called for responsable ID: " + rd.getId() + " ===");
        try {
            ResponsableDepartementDTO dto = new ResponsableDepartementDTO();
            dto.setId(rd.getId());
            dto.setAnnee(rd.getAnnee());
            dto.setUtilisateurId(rd.getUtilisateur().getId());
            dto.setUtilisateurNom(rd.getUtilisateur().getNom());
            dto.setUtilisateurEmail(rd.getUtilisateur().getEmail());
            dto.setUtilisateurMatricule(rd.getUtilisateur().getMatricule());
            dto.setDepartementId(rd.getDepartement().getId());
            dto.setDepartementNom(rd.getDepartement().getNom());
            dto.setDateCreation(rd.getDateCreation());
            dto.setDateModification(rd.getDateModification()); // Can be null
            dto.setUtilisateurModification(rd.getUtilisateurModification()); // Can be null
            dto.setActif(rd.getActif());
            dto.setRaisonModification(rd.getRaisonModification()); // Can be null
            logger.info("=== DEBUG: toDTO completed successfully ===");
            return dto;
        } catch (Exception e) {
            logger.error("=== ERROR in toDTO ===");
            logger.error("Error message: " + e.getMessage());
            logger.error("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            throw e;
        }
    }
    
    // Validation methods
    @Override
    public boolean validateYearAssignment(Integer annee) {
        if (annee == null) {
            throw new IllegalArgumentException("L'année ne peut pas être null");
        }
        
        int currentYear = Year.now().getValue();
        logger.info("=== DEBUG: Validating year assignment ===");
        logger.info("Requested year: " + annee);
        logger.info("Current year: " + currentYear);
        
        if (annee < 2020 || annee > 2030) {
            throw new IllegalArgumentException("L'année doit être entre 2020 et 2030");
        }
        
        // Allow assignments for current year and future years
        if (annee < currentYear) {
            throw new IllegalArgumentException("Impossible d'assigner une responsabilité pour une année passée. Année demandée: " + annee + ", Année actuelle: " + currentYear);
        }
        
        logger.info("=== DEBUG: Year validation passed ===");
        return true;
    }
    
    @Override
    public boolean validateUserExists(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("L'ID utilisateur ne peut pas être null");
        }
        
        Optional<Utilisateur> user = utilisateurRepository.findById(userId);
        if (!user.isPresent()) {
            throw new IllegalArgumentException("Utilisateur non trouvé avec l'ID: " + userId);
        }
        
        return true;
    }
    
    @Override
    public boolean validateDepartementExists(Integer departementId) {
        if (departementId == null) {
            throw new IllegalArgumentException("L'ID département ne peut pas être null");
        }
        
        Optional<Departement> departement = departementRepository.findById(departementId);
        if (!departement.isPresent()) {
            throw new IllegalArgumentException("Département non trouvé avec l'ID: " + departementId);
        }
        
        return true;
    }
    
    @Override
    public boolean validateReassignment(Integer departementId, Integer userId, Integer annee) {
        // Validate inputs
        validateYearAssignment(annee);
        validateUserExists(userId);
        validateDepartementExists(departementId);
        
        // Check if user is already responsible for this department in this year
        Optional<ResponsableDepartement> existingAssignment = responsableDepartementRepository
                .findByUtilisateurIdAndAnnee(userId, annee);
        
        if (existingAssignment.isPresent()) {
            ResponsableDepartement existing = existingAssignment.get();
            if (existing.getDepartement().getId().equals(departementId)) {
                throw new IllegalArgumentException("L'utilisateur est déjà responsable de ce département pour l'année " + annee);
            }
        }
        
        return true;
    }
    
    @Override
    public boolean canUserBeResponsable(Integer userId, Integer annee) {
        validateUserExists(userId);
        validateYearAssignment(annee);
        
        // Check if user is already responsible for another department in this year
        Long activeAssignments = responsableDepartementRepository.countActiveByUtilisateurIdAndAnnee(userId, annee);
        return activeAssignments == 0;
    }
    
    // Business logic methods
    @Override
    @Transactional
    public void deactivateCurrentResponsable(Integer departementId, Integer annee, String modifiedBy, String reason) {
        Optional<ResponsableDepartement> currentResponsable = responsableDepartementRepository
                .findByDepartementIdAndAnnee(departementId, annee);
        
        if (currentResponsable.isPresent()) {
            ResponsableDepartement responsable = currentResponsable.get();
            responsable.setActif(false);
            responsable.setUtilisateurModification(modifiedBy);
            responsable.setRaisonModification(reason);
            responsableDepartementRepository.save(responsable);
        }
    }
    
    @Override
    @Transactional
    public void deactivateUserAssignments(Integer userId, Integer annee, String modifiedBy, String reason) {
        List<ResponsableDepartement> userAssignments = responsableDepartementRepository
                .findAllByUtilisateurIdAndAnnee(userId, annee);
        
        for (ResponsableDepartement assignment : userAssignments) {
            if (assignment.getActif()) {
                assignment.setActif(false);
                assignment.setUtilisateurModification(modifiedBy);
                assignment.setRaisonModification(reason);
                responsableDepartementRepository.save(assignment);
            }
        }
    }
    
    // Enhanced CRUD operations
    @Override
    public List<ResponsableDepartementDTO> findAll() {
        try {
            List<ResponsableDepartement> responsables = responsableDepartementRepository.findAllResponsables();
            return responsables.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération des responsables: " + e.getMessage(), e);
        }
    }
    
    @Override
    public List<ResponsableDepartementDTO> findAllActive() {
        List<ResponsableDepartement> responsables = responsableDepartementRepository.findAllActive();
        return responsables.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ResponsableDepartementDTO> findAllResponsables() {
        List<ResponsableDepartement> responsables = responsableDepartementRepository.findAllResponsables();
        return responsables.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ResponsableDepartementDTO> findByAnnee(Integer annee) {
        validateYearAssignment(annee);
        return responsableDepartementRepository.findByAnnee(annee)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ResponsableDepartementDTO> findByDepartementId(Integer departementId) {
        validateDepartementExists(departementId);
        return responsableDepartementRepository.findByDepartementId(departementId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ResponsableDepartementDTO> findAllByDepartementId(Integer departementId) {
        validateDepartementExists(departementId);
        return responsableDepartementRepository.findAllByDepartementId(departementId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public ResponsableDepartementDTO findById(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID ne peut pas être null");
        }
        
        return responsableDepartementRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("Responsable non trouvé avec l'ID: " + id));
    }
    
    @Override
    @Transactional
    public CreateResponsableResponseDTO createResponsable(CreateResponsableRequestDTO request) {
        logger.info("=== DEBUG: createResponsable called ===");
        logger.info("Request data: " + request.toString());
        
        // Validate input
        if (request == null) {
            throw new IllegalArgumentException("La requête ne peut pas être null");
        }
        
        if (!StringUtils.hasText(request.getEmail()) || !StringUtils.hasText(request.getNom()) || 
            !StringUtils.hasText(request.getMatricule())) {
            throw new IllegalArgumentException("Email, nom et matricule sont obligatoires");
        }
        
        logger.info("=== DEBUG: Basic validation passed ===");
        
        validateYearAssignment(request.getAnnee());
        logger.info("=== DEBUG: Year validation passed ===");
        
        validateDepartementExists(request.getDepartementId());
        logger.info("=== DEBUG: Department validation passed ===");
        
        // Check if user already exists
        Optional<Utilisateur> existingUser = utilisateurRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }
        
        Optional<Utilisateur> existingUserByMatricule = utilisateurRepository.findByMatricule(request.getMatricule());
        if (existingUserByMatricule.isPresent()) {
            throw new RuntimeException("Un utilisateur avec ce matricule existe déjà");
        }
        
        logger.info("=== DEBUG: User uniqueness validation passed ===");
        
        // Check if department already has a responsable for this year
        Optional<ResponsableDepartement> existingDepartementResponsable = responsableDepartementRepository
                .findByDepartementIdAndAnnee(request.getDepartementId(), request.getAnnee());
        if (existingDepartementResponsable.isPresent()) {
            throw new RuntimeException("Ce département a déjà un responsable pour l'année " + request.getAnnee());
        }
        
        logger.info("=== DEBUG: Department assignment validation passed ===");
        
        // Get department
        Departement departement = departementRepository.findById(request.getDepartementId())
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));
        
        // Generate secure password
        String generatedPassword = generateSecurePassword();
        
        // Create user
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMatricule(request.getMatricule());
        utilisateur.setRole("USER");
        utilisateur.setPassword(passwordEncoder.encode(generatedPassword));
        // Note: USER role users don't have a departement field in Utilisateur table
        // Their department assignment is only in ResponsableDepartement table
        
        utilisateur = utilisateurRepository.save(utilisateur);
        logger.info("=== DEBUG: User created successfully ===");
        
        // Create responsable-departement relationship
        ResponsableDepartement responsableDepartement = new ResponsableDepartement();
        responsableDepartement.setAnnee(request.getAnnee());
        responsableDepartement.setUtilisateur(utilisateur);
        responsableDepartement.setDepartement(departement);
        responsableDepartement.setActif(true);
        
        responsableDepartement = responsableDepartementRepository.save(responsableDepartement);
        logger.info("=== DEBUG: Responsable assignment created successfully ===");
        
        // Send email with password
        try {
            emailService.sendPasswordEmail(request.getEmail(), request.getNom(), generatedPassword);
        } catch (Exception e) {
            // Log the error but don't fail the operation
            logger.error("Erreur lors de l'envoi de l'email: " + e.getMessage());
        }
        
        // Create response
        CreateResponsableResponseDTO response = new CreateResponsableResponseDTO();
        response.setId(responsableDepartement.getId());
        response.setNom(request.getNom());
        response.setEmail(request.getEmail());
        response.setMatricule(request.getMatricule());
        response.setDepartementNom(departement.getNom());
        response.setAnnee(request.getAnnee());
        response.setGeneratedPassword(generatedPassword);
        response.setMessage("Responsable créé avec succès. Un email avec le mot de passe a été envoyé.");
        
        logger.info("=== DEBUG: createResponsable completed successfully ===");
        return response;
    }
    
    @Override
    @Transactional
    public ResponsableDepartementDTO update(Integer id, ResponsableDepartementDTO dto) {
        logger.info("=== DEBUG: update method called for ID: " + id + " ===");
        logger.info("=== DEBUG: DTO data: " + dto.toString() + " ===");
        
        if (id == null) {
            throw new IllegalArgumentException("L'ID ne peut pas être null");
        }
        
        ResponsableDepartement responsableDepartement = responsableDepartementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Responsable non trouvé"));
        
        logger.info("=== DEBUG: Found responsable with department ID: " + responsableDepartement.getDepartement().getId() + " ===");
        
        // Validate that we're not modifying historical data
        validateHistoricalIntegrity(responsableDepartement.getDepartement().getId(), responsableDepartement.getAnnee());
        
        // Handle department change if provided
        if (dto.getDepartementId() != null && !dto.getDepartementId().equals(responsableDepartement.getDepartement().getId())) {
            logger.info("=== DEBUG: Department change requested from " + responsableDepartement.getDepartement().getId() + " to " + dto.getDepartementId() + " ===");
            
            // Check if the new department is already assigned to someone else for this year
            Optional<ResponsableDepartement> existingAssignment = responsableDepartementRepository
                    .findByDepartementIdAndAnnee(dto.getDepartementId(), responsableDepartement.getAnnee());
            
            if (existingAssignment.isPresent() && existingAssignment.get().getActif()) {
                logger.info("=== DEBUG: Department " + dto.getDepartementId() + " is already assigned for year " + responsableDepartement.getAnnee() + " ===");
                throw new RuntimeException("Ce département est déjà assigné à quelqu'un pour l'année " + responsableDepartement.getAnnee());
            }
            
            // Get the new department
            Departement newDepartement = departementRepository.findById(dto.getDepartementId())
                    .orElseThrow(() -> new RuntimeException("Département non trouvé avec l'ID: " + dto.getDepartementId()));
            
            // Note: For USER role, we don't update Utilisateur.departement
            // The department assignment is only in ResponsableDepartement table
            
            // Update the department
            responsableDepartement.setDepartement(newDepartement);
            responsableDepartement.setUtilisateurModification("admin@cihbank.ma"); // You might want to get this from the request
            responsableDepartement.setRaisonModification("Changement de département");
            
            logger.info("=== DEBUG: Department updated successfully ===");
        }
        
        // Update other allowed fields
        if (dto.getActif() != null) {
            responsableDepartement.setActif(dto.getActif());
            logger.info("=== DEBUG: Active status updated to: " + dto.getActif() + " ===");
        }
        
        if (StringUtils.hasText(dto.getRaisonModification())) {
            responsableDepartement.setRaisonModification(dto.getRaisonModification());
            logger.info("=== DEBUG: Reason updated to: " + dto.getRaisonModification() + " ===");
        }
        
        responsableDepartement = responsableDepartementRepository.save(responsableDepartement);
        logger.info("=== DEBUG: Responsable updated successfully ===");
        
        return toDTO(responsableDepartement);
    }
    
    @Override
    @Transactional
    public void delete(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID ne peut pas être null");
        }
        
        ResponsableDepartement responsableDepartement = responsableDepartementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Responsable non trouvé"));
        
        // Soft delete instead of hard delete
        responsableDepartement.setActif(false);
        responsableDepartement.setRaisonModification("Suppression");
        responsableDepartementRepository.save(responsableDepartement);
    }
    
    @Override
    @Transactional
    public void deactivate(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID ne peut pas être null");
        }
        
        ResponsableDepartement responsableDepartement = responsableDepartementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Responsable non trouvé"));
        
        responsableDepartement.setActif(false);
        responsableDepartement.setRaisonModification("Désactivation");
        responsableDepartementRepository.save(responsableDepartement);
    }
    
    // New methods to fix identified bugs
    @Override
    @Transactional
    public ResponsableDepartementDTO reassignResponsable(Integer departementId, Integer newUserId, Integer annee, String modifiedBy, String reason) {
        validateReassignment(departementId, newUserId, annee);
        
        // Deactivate current responsible for this department
        deactivateCurrentResponsable(departementId, annee, modifiedBy, reason);
        
        // Deactivate any existing assignments for the new user in this year
        deactivateUserAssignments(newUserId, annee, modifiedBy, "Réassignation");
        
        // Create new assignment
        return createResponsableForExistingUser(newUserId, departementId, annee, modifiedBy);
    }
    
    @Override
    @Transactional
    public ResponsableDepartementDTO changeDepartementResponsable(Integer departementId, Integer newUserId, Integer annee, String modifiedBy, String reason) {
        validateReassignment(departementId, newUserId, annee);
        
        // Deactivate current responsible
        deactivateCurrentResponsable(departementId, annee, modifiedBy, reason);
        
        // Create new assignment
        return createResponsableForExistingUser(newUserId, departementId, annee, modifiedBy);
    }
    
    @Override
    public List<ResponsableDepartementDTO> getUserAssignments(Integer userId) {
        validateUserExists(userId);
        
        return responsableDepartementRepository.findActiveByUtilisateurId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ResponsableDepartementDTO> getDepartementHistory(Integer departementId) {
        validateDepartementExists(departementId);
        
        return responsableDepartementRepository.findHistoryByDepartementId(departementId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public ResponsableDepartementDTO getCurrentResponsable(Integer departementId, Integer annee) {
        validateDepartementExists(departementId);
        validateYearAssignment(annee);
        
        Optional<ResponsableDepartement> responsable = responsableDepartementRepository
                .findByDepartementIdAndAnnee(departementId, annee);
        
        return responsable.map(this::toDTO).orElse(null);
    }
    
    @Override
    public void validateHistoricalIntegrity(Integer departementId, Integer annee) {
        int currentYear = Year.now().getValue();
        
        if (annee < currentYear) {
            throw new IllegalArgumentException("Impossible de modifier les données historiques");
        }
    }
    
    @Override
    public ResponsableDepartementDTO createResponsableForExistingUser(Integer userId, Integer departementId, Integer annee, String modifiedBy) {
        validateUserExists(userId);
        validateDepartementExists(departementId);
        validateYearAssignment(annee);
        
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Departement departement = departementRepository.findById(departementId)
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));
        
        // Note: For USER role, we don't set Utilisateur.departement
        // The department assignment is only in ResponsableDepartement table
        
        ResponsableDepartement responsableDepartement = new ResponsableDepartement();
        responsableDepartement.setAnnee(annee);
        responsableDepartement.setUtilisateur(utilisateur);
        responsableDepartement.setDepartement(departement);
        responsableDepartement.setActif(true);
        responsableDepartement.setUtilisateurModification(modifiedBy);
        responsableDepartement.setRaisonModification("Création");
        
        responsableDepartement = responsableDepartementRepository.save(responsableDepartement);
        return toDTO(responsableDepartement);
    }
    
    // Pagination methods
    @Override
    public Page<ResponsableDepartementDTO> findAllActiveWithPagination(Pageable pageable) {
        logger.info("=== DEBUG: findAllActiveWithPagination called ===");
        try {
            logger.info("=== DEBUG: Calling repository method ===");
            Page<ResponsableDepartement> responsablesPage = responsableDepartementRepository.findByActifTrue(pageable);
            logger.info("=== DEBUG: Repository call successful, found " + responsablesPage.getTotalElements() + " elements ===");
            
            Page<ResponsableDepartementDTO> dtosPage = responsablesPage.map(this::toDTO);
            logger.info("=== DEBUG: DTO mapping successful ===");
            
            return dtosPage;
        } catch (Exception e) {
            logger.error("=== ERROR in findAllActiveWithPagination ===");
            logger.error("Error message: " + e.getMessage());
            logger.error("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public Page<ResponsableDepartementDTO> findByAnneeWithPagination(Integer annee, Pageable pageable) {
        validateYearAssignment(annee);
        return responsableDepartementRepository.findByAnneeAndActifTrue(annee, pageable)
                .map(this::toDTO);
    }
    
    // Audit methods
    @Override
    public List<ResponsableDepartementDTO> findModificationsByUser(String utilisateurModification) {
        if (!StringUtils.hasText(utilisateurModification)) {
            throw new IllegalArgumentException("L'utilisateur de modification ne peut pas être vide");
        }
        
        return responsableDepartementRepository.findByUtilisateurModification(utilisateurModification)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ResponsableDepartementDTO> findModificationsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Les dates de début et de fin ne peuvent pas être null");
        }
        
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("La date de début ne peut pas être après la date de fin");
        }
        
        return responsableDepartementRepository.findModificationsBetweenDates(startDate, endDate)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
} 