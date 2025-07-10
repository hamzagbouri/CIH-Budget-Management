package com.example.demo.service.impl;

import com.example.demo.dto.DepartementDTO;
import com.example.demo.entity.Departement;
import com.example.demo.repository.DepartementRepository;
import com.example.demo.service.DepartementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartementServiceImpl implements DepartementService {
    @Autowired
    private DepartementRepository departementRepository;

    private DepartementDTO toDTO(Departement d) {
        DepartementDTO dto = new DepartementDTO();
        dto.setId(d.getId());
        dto.setNom(d.getNom());
        return dto;
    }

    private Departement toEntity(DepartementDTO dto) {
        Departement d = new Departement();
        d.setId(dto.getId());
        d.setNom(dto.getNom());
        return d;
    }

    @Override
    public List<DepartementDTO> findAll() {
        return departementRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public DepartementDTO findById(Integer id) {
        return departementRepository.findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public DepartementDTO save(DepartementDTO departementDTO) {
        Departement d = toEntity(departementDTO);
        return toDTO(departementRepository.save(d));
    }

    @Override
    public DepartementDTO update(Integer id, DepartementDTO departementDTO) {
        Departement d = toEntity(departementDTO);
        d.setId(id);
        return toDTO(departementRepository.save(d));
    }

    @Override
    public void delete(Integer id) {
        departementRepository.deleteById(id);
    }
} 