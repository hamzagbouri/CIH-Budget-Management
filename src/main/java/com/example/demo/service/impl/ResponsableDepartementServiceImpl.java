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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class ResponsableDepartementServiceImpl implements ResponsableDepartementService {
    
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
    
    private String generatePassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        Random random = new Random();
        
        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return password.toString();
    }
    
    private ResponsableDepartementDTO toDTO(ResponsableDepartement rd) {
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
        dto.setActif(rd.getActif());
        return dto;
    }
    
    @Override
    public List<ResponsableDepartementDTO> findAll() {
        System.out.println("=== ResponsableDepartementServiceImpl.findAll() called ===");
        try {
            List<ResponsableDepartement> responsables = responsableDepartementRepository.findAllResponsables();
            System.out.println("Found " + responsables.size() + " responsables in database");
            return responsables.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in findAll: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public List<ResponsableDepartementDTO> findAllActive() {
        System.out.println("=== ResponsableDepartementServiceImpl.findAllActive() called ===");
        List<ResponsableDepartement> responsables = responsableDepartementRepository.findAllActive();
        System.out.println("Found " + responsables.size() + " active responsables in database");
        return responsables.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ResponsableDepartementDTO> findAllResponsables() {
        System.out.println("=== ResponsableDepartementServiceImpl.findAllResponsables() called ===");
        List<ResponsableDepartement> responsables = responsableDepartementRepository.findAllResponsables();
        System.out.println("Found " + responsables.size() + " all responsables in database");
        return responsables.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ResponsableDepartementDTO> findByAnnee(Integer annee) {
        return responsableDepartementRepository.findByAnnee(annee)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ResponsableDepartementDTO> findByDepartementId(Integer departementId) {
        return responsableDepartementRepository.findByDepartementId(departementId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ResponsableDepartementDTO> findAllByDepartementId(Integer departementId) {
        return responsableDepartementRepository.findAllByDepartementId(departementId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public ResponsableDepartementDTO findById(Integer id) {
        return responsableDepartementRepository.findById(id)
                .map(this::toDTO)
                .orElse(null);
    }
    
    @Override
    @Transactional
    public CreateResponsableResponseDTO createResponsable(CreateResponsableRequestDTO request) {
        // Check if user already exists
        Optional<Utilisateur> existingUser = utilisateurRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }
        
        // Check if user is already responsable for this year (this check is not needed for new users)
        // But we can check by matricule if needed
        Optional<Utilisateur> existingUserByMatricule = utilisateurRepository.findByMatricule(request.getMatricule());
        if (existingUserByMatricule.isPresent()) {
            throw new RuntimeException("Un utilisateur avec ce matricule existe déjà");
        }
        
        // Check if department already has a responsable for this year
        Optional<ResponsableDepartement> existingDepartementResponsable = responsableDepartementRepository
                .findByDepartementIdAndAnnee(request.getDepartementId(), request.getAnnee());
        if (existingDepartementResponsable.isPresent()) {
            throw new RuntimeException("Ce département a déjà un responsable pour l'année " + request.getAnnee());
        }
        
        // Get department
        Departement departement = departementRepository.findById(request.getDepartementId())
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));
        
        // Generate password
        String generatedPassword = generatePassword();
        
        // Create user
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMatricule(request.getMatricule());
        utilisateur.setRole("USER");
        utilisateur.setPassword(passwordEncoder.encode(generatedPassword));
        utilisateur.setDepartement(departement);
        
        utilisateur = utilisateurRepository.save(utilisateur);
        
        // Create responsable-departement relationship
        ResponsableDepartement responsableDepartement = new ResponsableDepartement();
        responsableDepartement.setAnnee(request.getAnnee());
        responsableDepartement.setUtilisateur(utilisateur);
        responsableDepartement.setDepartement(departement);
        responsableDepartement.setActif(true);
        
        responsableDepartement = responsableDepartementRepository.save(responsableDepartement);
        
        // Send email with password
        try {
            emailService.sendPasswordEmail(request.getEmail(), request.getNom(), generatedPassword);
        } catch (Exception e) {
            // Log the error but don't fail the operation
            System.err.println("Erreur lors de l'envoi de l'email: " + e.getMessage());
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
        
        return response;
    }
    
    @Override
    @Transactional
    public ResponsableDepartementDTO update(Integer id, ResponsableDepartementDTO dto) {
        ResponsableDepartement responsableDepartement = responsableDepartementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Responsable non trouvé"));
        
        // Update logic here if needed
        // For now, we'll just return the existing one
        return toDTO(responsableDepartement);
    }
    
    @Override
    @Transactional
    public void delete(Integer id) {
        responsableDepartementRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public void deactivate(Integer id) {
        ResponsableDepartement responsableDepartement = responsableDepartementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Responsable non trouvé"));
        responsableDepartement.setActif(false);
        responsableDepartementRepository.save(responsableDepartement);
    }
} 