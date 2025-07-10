package com.example.demo.repository;

import com.example.demo.entity.BudgetDepartement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetDepartementRepository extends JpaRepository<BudgetDepartement, Integer> {
} 