package com.example.demo.repository;

import com.example.demo.entity.ResponsableDepartement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResponsableDepartementRepository extends JpaRepository<ResponsableDepartement, Integer> {
    
    @Query("SELECT rd FROM ResponsableDepartement rd WHERE rd.utilisateur.id = :utilisateurId AND rd.annee = :annee AND rd.actif = true")
    Optional<ResponsableDepartement> findByUtilisateurIdAndAnnee(@Param("utilisateurId") Integer utilisateurId, @Param("annee") Integer annee);
    
    @Query("SELECT rd FROM ResponsableDepartement rd WHERE rd.departement.id = :departementId AND rd.annee = :annee AND rd.actif = true")
    Optional<ResponsableDepartement> findByDepartementIdAndAnnee(@Param("departementId") Integer departementId, @Param("annee") Integer annee);
    
    @Query("SELECT rd FROM ResponsableDepartement rd WHERE rd.annee = :annee AND rd.actif = true")
    List<ResponsableDepartement> findByAnnee(@Param("annee") Integer annee);
    
    @Query("SELECT rd FROM ResponsableDepartement rd WHERE rd.utilisateur.role = 'USER' AND rd.actif = true")
    List<ResponsableDepartement> findAllActiveResponsables();
    
    @Query("SELECT rd FROM ResponsableDepartement rd WHERE rd.actif = true")
    List<ResponsableDepartement> findAllActive();
    
    @Query("SELECT rd FROM ResponsableDepartement rd WHERE rd.utilisateur.role = 'USER'")
    List<ResponsableDepartement> findAllResponsables();
    
    @Query("SELECT rd FROM ResponsableDepartement rd WHERE rd.utilisateur.role = 'USER' AND rd.departement.id = :departementId AND rd.actif = true")
    List<ResponsableDepartement> findByDepartementId(@Param("departementId") Integer departementId);
    
    @Query("SELECT rd FROM ResponsableDepartement rd WHERE rd.utilisateur.role = 'USER' AND rd.departement.id = :departementId")
    List<ResponsableDepartement> findAllByDepartementId(@Param("departementId") Integer departementId);
    
    // New method for admin functionality
    @Query("SELECT rd FROM ResponsableDepartement rd WHERE rd.departement.id = :departementId AND rd.annee = :annee AND rd.actif = true")
    ResponsableDepartement findByDepartementIdAndAnneeAndActifTrue(@Param("departementId") Integer departementId, @Param("annee") Integer annee);
    
    // New method for user profile functionality
    @Query("SELECT rd FROM ResponsableDepartement rd WHERE rd.utilisateur.id = :utilisateurId ORDER BY rd.annee DESC")
    List<ResponsableDepartement> findByUtilisateurIdOrderByAnneeDesc(@Param("utilisateurId") Integer utilisateurId);
} 