package com.example.demo.repository;

import com.example.demo.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {
    // méthodes personnalisées si besoin
} 