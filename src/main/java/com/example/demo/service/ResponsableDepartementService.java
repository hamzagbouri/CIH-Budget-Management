package com.example.demo.service;

import com.example.demo.dto.ResponsableDepartementDTO;
import com.example.demo.dto.CreateResponsableRequestDTO;
import com.example.demo.dto.CreateResponsableResponseDTO;
import java.util.List;

public interface ResponsableDepartementService {
    List<ResponsableDepartementDTO> findAll();
    List<ResponsableDepartementDTO> findAllActive();
    List<ResponsableDepartementDTO> findAllResponsables();
    List<ResponsableDepartementDTO> findByAnnee(Integer annee);
    List<ResponsableDepartementDTO> findByDepartementId(Integer departementId);
    List<ResponsableDepartementDTO> findAllByDepartementId(Integer departementId);
    ResponsableDepartementDTO findById(Integer id);
    CreateResponsableResponseDTO createResponsable(CreateResponsableRequestDTO request);
    ResponsableDepartementDTO update(Integer id, ResponsableDepartementDTO dto);
    void delete(Integer id);
    void deactivate(Integer id);
} 