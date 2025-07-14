package com.example.demo.repository;

import com.example.demo.entity.BudgetDepartement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetDepartementRepository extends JpaRepository<BudgetDepartement, Integer> {
    List<BudgetDepartement> findByAnnee(Integer annee);
    List<BudgetDepartement> findByDepartementId(Integer departementId);
    Optional<BudgetDepartement> findByDepartementIdAndAnnee(Integer departementId, Integer annee);
} 