package com.example.demo.repository;

import com.example.demo.entity.Departement;
import com.example.demo.entity.Depense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DepenseRepository extends JpaRepository<Depense, Integer> {
    List<Depense> findByDepartementOrderByDateDesc(Departement departement);
    List<Depense> findByDepartementAndDateBetween(Departement departement, LocalDate startDate, LocalDate endDate);
    List<Depense> findByStatus(String status);
    List<Depense> findByDepartementAndStatus(Departement departement, String status);
    List<Depense> findByDepartementId(Integer departementId);
    
    // New methods for admin functionality
    @Query("SELECT d FROM Depense d WHERE YEAR(d.date) = :annee")
    List<Depense> findByAnnee(@Param("annee") Integer annee);
    
    @Query("SELECT d FROM Depense d WHERE d.departement.id = :departementId AND YEAR(d.date) = :annee")
    List<Depense> findByDepartementIdAndAnnee(@Param("departementId") Integer departementId, @Param("annee") Integer annee);
} 