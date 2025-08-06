package com.example.demo.service;

import com.example.demo.dto.ResponsableDepartementDTO;
import com.example.demo.dto.CreateResponsableRequestDTO;
import com.example.demo.dto.CreateResponsableResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ResponsableDepartementService {
    
    // Basic CRUD operations
    List<ResponsableDepartementDTO> findAll();
    List<ResponsableDepartementDTO> findAllActive();
    List<ResponsableDepartementDTO> findAllResponsables();
    ResponsableDepartementDTO findById(Integer id);
    CreateResponsableResponseDTO createResponsable(CreateResponsableRequestDTO request);
    ResponsableDepartementDTO update(Integer id, ResponsableDepartementDTO dto);
    void delete(Integer id);
    void deactivate(Integer id);
    
    // Enhanced query methods
    List<ResponsableDepartementDTO> findByAnnee(Integer annee);
    List<ResponsableDepartementDTO> findByDepartementId(Integer departementId);
    List<ResponsableDepartementDTO> findAllByDepartementId(Integer departementId);
    
    // New methods to fix identified bugs
    ResponsableDepartementDTO reassignResponsable(Integer departementId, Integer newUserId, Integer annee, String modifiedBy, String reason);
    ResponsableDepartementDTO changeDepartementResponsable(Integer departementId, Integer newUserId, Integer annee, String modifiedBy, String reason);
    List<ResponsableDepartementDTO> getUserAssignments(Integer userId);
    List<ResponsableDepartementDTO> getDepartementHistory(Integer departementId);
    boolean canUserBeResponsable(Integer userId, Integer annee);
    ResponsableDepartementDTO getCurrentResponsable(Integer departementId, Integer annee);
    void validateHistoricalIntegrity(Integer departementId, Integer annee);
    
    // Pagination methods
    Page<ResponsableDepartementDTO> findAllActiveWithPagination(Pageable pageable);
    Page<ResponsableDepartementDTO> findByAnneeWithPagination(Integer annee, Pageable pageable);
    
    // Audit methods
    List<ResponsableDepartementDTO> findModificationsByUser(String utilisateurModification);
    List<ResponsableDepartementDTO> findModificationsBetweenDates(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
    
    // Validation methods
    boolean validateReassignment(Integer departementId, Integer userId, Integer annee);
    boolean validateYearAssignment(Integer annee);
    boolean validateUserExists(Integer userId);
    boolean validateDepartementExists(Integer departementId);
    
    // Business logic methods
    void deactivateCurrentResponsable(Integer departementId, Integer annee, String modifiedBy, String reason);
    void deactivateUserAssignments(Integer userId, Integer annee, String modifiedBy, String reason);
    ResponsableDepartementDTO createResponsableForExistingUser(Integer userId, Integer departementId, Integer annee, String modifiedBy);
} 