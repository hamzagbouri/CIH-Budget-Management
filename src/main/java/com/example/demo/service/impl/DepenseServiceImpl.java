package com.example.demo.service.impl;

import com.example.demo.dto.DepenseDTO;
import com.example.demo.entity.Departement;
import com.example.demo.entity.Depense;
import com.example.demo.repository.DepartementRepository;
import com.example.demo.repository.DepenseRepository;
import com.example.demo.service.DepenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DepenseServiceImpl implements DepenseService {
    @Autowired
    private DepenseRepository depenseRepository;
    
    @Autowired
    private DepartementRepository departementRepository;

    private DepenseDTO toDTO(Depense d) {
        DepenseDTO dto = new DepenseDTO();
        dto.setId(d.getId());
        dto.setTitre(d.getTitre());
        dto.setDescription(d.getDescription());
        dto.setType(d.getType());
        dto.setDate(d.getDate());
        dto.setMontant(d.getMontant());
        if (d.getDepartement() != null) dto.setDepartementId(d.getDepartement().getId());
        return dto;
    }

    private Depense toEntity(DepenseDTO dto) {
        Depense d = new Depense();
        d.setId(dto.getId());
        d.setTitre(dto.getTitre());
        d.setDescription(dto.getDescription());
        d.setType(dto.getType());
        d.setDate(dto.getDate());
        d.setMontant(dto.getMontant());
        
        // Set department if departementId is provided
        if (dto.getDepartementId() != null) {
            Optional<Departement> departementOpt = departementRepository.findById(dto.getDepartementId());
            if (departementOpt.isPresent()) {
                d.setDepartement(departementOpt.get());
            }
        }
        
        return d;
    }

    @Override
    public List<DepenseDTO> findAll() {
        return depenseRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public DepenseDTO findById(Integer id) {
        return depenseRepository.findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public DepenseDTO save(DepenseDTO depenseDTO) {
        Depense d = toEntity(depenseDTO);
        return toDTO(depenseRepository.save(d));
    }

    @Override
    public DepenseDTO update(Integer id, DepenseDTO depenseDTO) {
        Depense d = toEntity(depenseDTO);
        d.setId(id);
        return toDTO(depenseRepository.save(d));
    }

    @Override
    public void delete(Integer id) {
        depenseRepository.deleteById(id);
    }
} 