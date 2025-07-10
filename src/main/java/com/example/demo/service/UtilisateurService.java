package com.example.demo.service;

import com.example.demo.dto.UtilisateurDTO;
import java.util.List;

public interface UtilisateurService {
    List<UtilisateurDTO> findAll();
    UtilisateurDTO findById(Integer id);
    UtilisateurDTO save(UtilisateurDTO utilisateurDTO);
    UtilisateurDTO update(Integer id, UtilisateurDTO utilisateurDTO);
    void delete(Integer id);
} 