package com.example.demo.service.impl;

import com.example.demo.dto.UtilisateurDTO;
import com.example.demo.entity.Utilisateur;
import com.example.demo.repository.UtilisateurRepository;
import com.example.demo.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UtilisateurServiceImpl implements UtilisateurService {
    @Autowired
    private UtilisateurRepository utilisateurRepository;

    private UtilisateurDTO toDTO(Utilisateur u) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(u.getId());
        dto.setNom(u.getNom());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole());
        dto.setMatricule(u.getMatricule());
        if (u.getDepartement() != null) dto.setDepartementId(u.getDepartement().getId());
        return dto;
    }

    private Utilisateur toEntity(UtilisateurDTO dto) {
        Utilisateur u = new Utilisateur();
        u.setId(dto.getId());
        u.setNom(dto.getNom());
        u.setEmail(dto.getEmail());
        u.setRole(dto.getRole());
        u.setMatricule(dto.getMatricule());
        // Pour departement, il faut injecter DepartementRepository si besoin
        return u;
    }

    @Override
    public List<UtilisateurDTO> findAll() {
        return utilisateurRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public UtilisateurDTO findById(Integer id) {
        return utilisateurRepository.findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public UtilisateurDTO save(UtilisateurDTO utilisateurDTO) {
        Utilisateur u = toEntity(utilisateurDTO);
        return toDTO(utilisateurRepository.save(u));
    }

    @Override
    public UtilisateurDTO update(Integer id, UtilisateurDTO utilisateurDTO) {
        Utilisateur u = toEntity(utilisateurDTO);
        u.setId(id);
        return toDTO(utilisateurRepository.save(u));
    }

    @Override
    public void delete(Integer id) {
        utilisateurRepository.deleteById(id);
    }
} 