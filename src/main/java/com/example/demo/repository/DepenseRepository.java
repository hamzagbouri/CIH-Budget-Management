package com.example.demo.repository;

import com.example.demo.entity.Departement;
import com.example.demo.entity.Depense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DepenseRepository extends JpaRepository<Depense, Integer> {
    List<Depense> findByDepartementOrderByDateDesc(Departement departement);
    List<Depense> findByDepartementAndDateBetween(Departement departement, LocalDate startDate, LocalDate endDate);
} 