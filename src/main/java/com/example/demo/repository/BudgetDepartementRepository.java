package com.example.demo.repository;

import com.example.demo.entity.BudgetDepartement;
import com.example.demo.entity.Departement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BudgetDepartementRepository extends JpaRepository<BudgetDepartement, Integer> {
    Optional<BudgetDepartement> findByDepartementAndBudgetAnnee(Departement departement, Integer annee);
} 