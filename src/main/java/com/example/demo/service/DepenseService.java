package com.example.demo.service;

import com.example.demo.dto.DepenseDTO;
import java.util.List;

public interface DepenseService {
    List<DepenseDTO> findAll();
    DepenseDTO findById(Integer id);
    DepenseDTO save(DepenseDTO depenseDTO);
    DepenseDTO update(Integer id, DepenseDTO depenseDTO);
    void delete(Integer id);
    Float getRemainingBudget(Integer departementId, Integer year);
    // New methods
    DepenseDTO validateDepense(Integer id);
    DepenseDTO invalidateDepense(Integer id);
    List<DepenseDTO> findByStatus(String status);
    List<DepenseDTO> findByDepartementAndStatus(Integer departementId, String status);
    List<DepenseDTO> findAllFiltered(Integer departementId, Integer annee, String status);
    List<DepenseDTO> findForCurrentUserDepartement(String email, Integer annee, String status);
} 