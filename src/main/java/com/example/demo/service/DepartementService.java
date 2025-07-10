package com.example.demo.service;

import com.example.demo.dto.DepartementDTO;
import java.util.List;

public interface DepartementService {
    List<DepartementDTO> findAll();
    DepartementDTO findById(Integer id);
    DepartementDTO save(DepartementDTO departementDTO);
    DepartementDTO update(Integer id, DepartementDTO departementDTO);
    void delete(Integer id);
} 