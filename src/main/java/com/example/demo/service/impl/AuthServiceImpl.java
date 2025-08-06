package com.example.demo.service.impl;

import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.LoginResponseDTO;
import com.example.demo.dto.LogoutResponseDTO;
import com.example.demo.dto.PasswordUpdateDTO;
import com.example.demo.dto.PasswordUpdateResponseDTO;
import com.example.demo.dto.RegisterRequestDTO;
import com.example.demo.dto.RegisterResponseDTO;
import com.example.demo.dto.UtilisateurDTO;
import com.example.demo.entity.Departement;
import com.example.demo.entity.Utilisateur;
import com.example.demo.repository.DepartementRepository;
import com.example.demo.repository.UtilisateurRepository;
import com.example.demo.service.AuthService;
import com.example.demo.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private DepartementRepository departementRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        LoginResponseDTO response = new LoginResponseDTO();
        
        try {
            // Find user by email
            Optional<Utilisateur> userOpt = utilisateurRepository.findByEmail(loginRequest.getEmail());
            
            if (userOpt.isEmpty()) {
                response.setSuccess(false);
                response.setMessage("Email ou mot de passe incorrect");
                return response;
            }
            
            Utilisateur user = userOpt.get();
            
            // Check password using BCrypt
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                response.setSuccess(false);
                response.setMessage("Email ou mot de passe incorrect");
                return response;
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());
            
            // Convert to DTO for response
            UtilisateurDTO userDTO = new UtilisateurDTO();
            userDTO.setId(user.getId());
            userDTO.setNom(user.getNom());
            userDTO.setEmail(user.getEmail());
            userDTO.setRole(user.getRole());
            userDTO.setMatricule(user.getMatricule());
            // Note: USER role users don't have departementId in Utilisateur table
            // Their department assignment is only in ResponsableDepartement table
            
            // Set response
            response.setSuccess(true);
            response.setToken(token);
            response.setUser(userDTO);
            response.setMessage("Connexion réussie");
            
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Erreur lors de la connexion: " + e.getMessage());
        }
        
        return response;
    }
    
    @Override
    public RegisterResponseDTO register(RegisterRequestDTO registerRequest) {
        RegisterResponseDTO response = new RegisterResponseDTO();
        
        try {
            // Check if email already exists
            if (utilisateurRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
                response.setSuccess(false);
                response.setMessage("Un utilisateur avec cet email existe déjà");
                return response;
            }
            
            // Check if matricule already exists
            if (utilisateurRepository.findByMatricule(registerRequest.getMatricule()).isPresent()) {
                response.setSuccess(false);
                response.setMessage("Un utilisateur avec ce matricule existe déjà");
                return response;
            }
            
            // Validate required fields
            if (registerRequest.getNom() == null || registerRequest.getNom().trim().isEmpty()) {
                response.setSuccess(false);
                response.setMessage("Le nom est obligatoire");
                return response;
            }
            
            if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
                response.setSuccess(false);
                response.setMessage("L'email est obligatoire");
                return response;
            }
            
            if (registerRequest.getPassword() == null || registerRequest.getPassword().trim().isEmpty()) {
                response.setSuccess(false);
                response.setMessage("Le mot de passe est obligatoire");
                return response;
            }
            
            if (registerRequest.getMatricule() == null || registerRequest.getMatricule().trim().isEmpty()) {
                response.setSuccess(false);
                response.setMessage("Le matricule est obligatoire");
                return response;
            }
            
            // Create new user
            Utilisateur newUser = new Utilisateur();
            newUser.setNom(registerRequest.getNom().trim());
            newUser.setEmail(registerRequest.getEmail().trim().toLowerCase());
            newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword())); // Hash password with BCrypt
            newUser.setRole(registerRequest.getRole() != null ? registerRequest.getRole() : "USER");
            newUser.setMatricule(registerRequest.getMatricule().trim());
            
            // Note: USER role users don't have a departement field in Utilisateur table
            // Their department assignment is only in ResponsableDepartement table
            
            // Save user
            Utilisateur savedUser = utilisateurRepository.save(newUser);
            
            // Convert to DTO for response
            UtilisateurDTO userDTO = new UtilisateurDTO();
            userDTO.setId(savedUser.getId());
            userDTO.setNom(savedUser.getNom());
            userDTO.setEmail(savedUser.getEmail());
            userDTO.setRole(savedUser.getRole());
            userDTO.setMatricule(savedUser.getMatricule());
            // Note: USER role users don't have departementId in Utilisateur table
            
            // Set response
            response.setSuccess(true);
            response.setUser(userDTO);
            response.setMessage("Inscription réussie");
            
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Erreur lors de l'inscription: " + e.getMessage());
        }
        
        return response;
    }
    
    @Override
    public PasswordUpdateResponseDTO updatePassword(Integer userId, PasswordUpdateDTO passwordUpdateDTO) {
        PasswordUpdateResponseDTO response = new PasswordUpdateResponseDTO();
        
        try {
            // Find user by ID
            Optional<Utilisateur> userOpt = utilisateurRepository.findById(userId);
            
            if (userOpt.isEmpty()) {
                response.setSuccess(false);
                response.setMessage("Utilisateur non trouvé");
                return response;
            }
            
            Utilisateur user = userOpt.get();
            
            // Validate current password
            if (!passwordEncoder.matches(passwordUpdateDTO.getCurrentPassword(), user.getPassword())) {
                response.setSuccess(false);
                response.setMessage("Mot de passe actuel incorrect");
                return response;
            }
            
            // Validate new password
            if (passwordUpdateDTO.getNewPassword() == null || passwordUpdateDTO.getNewPassword().trim().isEmpty()) {
                response.setSuccess(false);
                response.setMessage("Le nouveau mot de passe est obligatoire");
                return response;
            }
            
            if (passwordUpdateDTO.getNewPassword().length() < 6) {
                response.setSuccess(false);
                response.setMessage("Le nouveau mot de passe doit contenir au moins 6 caractères");
                return response;
            }
            
            // Update password
            user.setPassword(passwordEncoder.encode(passwordUpdateDTO.getNewPassword()));
            utilisateurRepository.save(user);
            
            response.setSuccess(true);
            response.setMessage("Mot de passe mis à jour avec succès");
            
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Erreur lors de la mise à jour du mot de passe: " + e.getMessage());
        }
        
        return response;
    }
    
    @Override
    public LogoutResponseDTO logout(String token) {
        LogoutResponseDTO response = new LogoutResponseDTO();
        
        try {
            if (token == null || token.trim().isEmpty()) {
                response.setSuccess(false);
                response.setMessage("Token manquant");
                return response;
            }
            
            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            // Validate token format
            if (!jwtUtil.validateToken(token)) {
                response.setSuccess(false);
                response.setMessage("Token invalide");
                return response;
            }
            
            // In a more advanced implementation, you could:
            // 1. Add the token to a blacklist
            // 2. Store it in Redis with an expiration time
            // 3. Track logout events in the database
            
            // For now, we'll just validate the token and return success
            // The client should remove the token from their storage
            
            response.setSuccess(true);
            response.setMessage("Déconnexion réussie");
            
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Erreur lors de la déconnexion: " + e.getMessage());
        }
        
        return response;
    }
} 