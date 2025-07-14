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
} 